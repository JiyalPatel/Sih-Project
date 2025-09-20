
# timetable_scheduler/src/scheduler/timetable_solver.py
from collections import defaultdict

class TimetableSolver:
    """
    Clean, self-contained greedy solver working with DataLoader raw dicts.
    Produces one solution (greedy) and aggregates conflict counts.
    """

    def __init__(self, batches, subjects, faculty, classrooms, constraints):
        # store as lists/dicts as provided by DataLoader (batches, subjects, faculty, classrooms are lists of dicts)
        # normalize to id->dict maps for easy lookup
        self.batches = {b['id']: b for b in batches}
        self.subjects = {s['id']: s for s in subjects}
        self.faculty = {f['id']: f for f in faculty}
        self.classrooms = {r['id']: r for r in classrooms}
        self.constraints = constraints or {}
        self.conflict_counts = defaultdict(int)
        self.max_solutions = 1
        self.solutions = []

        # default availability when records don't specify them
        self.default_days = ['Mon','Tue','Wed','Thu','Fri']
        self.default_slots = ['1','2','3','4','5']

        # Calendars to avoid double booking: dict id -> day(str) -> set(slot_str)
        self.room_cal = defaultdict(lambda: defaultdict(set))
        self.fac_cal = defaultdict(lambda: defaultdict(set))
        self.batch_cal = defaultdict(lambda: defaultdict(set))

    def get_faculty_for_subject(self, subj_id):
        for fid, f in self.faculty.items():
            if subj_id in f.get('subjects', []):
                return fid
        return None

    def is_room_suitable(self, room, batch, subj, day, slots):
        room_type = room.get('type')
        subj_type = subj.get('type', 'theory')
        subj_is_lab = (subj_type == 'lab')
        if subj_is_lab and room_type != 'lab':
            return False
        if (not subj_is_lab) and room_type != 'lecture':
            return False
        if room.get('capacity', 0) < batch.get('strength', 0):
            return False
        room_days = room.get('available_days', self.default_days)
        room_slots = list(map(str, room.get('available_slots', self.default_slots)))
        if str(day) not in room_days:
            return False
        if not set(slots).issubset(set(room_slots)):
            return False
        # calendar conflicts
        if any(s in self.room_cal[room['id']].get(str(day), set()) for s in slots):
            return False
        return True

    def is_faculty_available(self, fid, day, slots, subj, batch):
        f = self.faculty.get(fid)
        if not f:
            return False
        fac_days = f.get('available_days', f.get('preferred_days', self.default_days))
        fac_slots = list(map(str, f.get('available_slots', f.get('preferred_slots', self.default_slots))))
        if str(day) not in fac_days:
            return False
        if not set(slots).issubset(set(fac_slots)):
            return False
        if any(s in self.fac_cal[fid].get(str(day), set()) for s in slots):
            return False
        return True

    def is_batch_available(self, batch_id, day, slots):
        b = self.batches.get(batch_id)
        if not b:
            return False
        b_days = b.get('available_days', self.default_days)
        b_slots = list(map(str, b.get('available_slots', self.default_slots)))
        if str(day) not in b_days:
            return False
        if not set(slots).issubset(set(b_slots)):
            return False
        if any(s in self.batch_cal[batch_id].get(str(day), set()) for s in slots):
            return False
        return True

    def assign(self, batch_id, subj_id, fid, room_id, day, slots):
        for s in slots:
            self.room_cal[room_id][str(day)].add(s)
            self.fac_cal[fid][str(day)].add(s)
            self.batch_cal[batch_id][str(day)].add(s)

    def solve(self, max_solutions=5):
        self.max_solutions = max_solutions
        assignment = []
        # Greedy: iterate batches in order, then subjects listed in batch
        for b_id, b in self.batches.items():
            subj_list = b.get('subjects', [])
            for subj_id in subj_list:
                subj = self.subjects.get(subj_id)
                if not subj:
                    self.conflict_counts['unknown_subject'] += 1
                    continue
                duration = subj.get('duration_slots', 1)
                subj_type = subj.get('type', 'theory')
                fid = self.get_faculty_for_subject(subj_id)
                if not fid:
                    self.conflict_counts['no_faculty_for_subject'] += 1
                    continue
                placed = False
                # iterate candidate rooms
                for room in self.classrooms.values():
                    # iterate over allowed days (intersection of room and batch, with defaults)
                    room_days = set(room.get('available_days', self.default_days))
                    batch_days = set(b.get('available_days', self.default_days))
                    for day in sorted(room_days & batch_days):
                        # try each possible start slot (respect room available slots)
                        room_slots_sorted = sorted(list(map(int, room.get('available_slots', self.default_slots))))
                        for start in room_slots_sorted:
                            slots = [str(s) for s in range(start, start + duration)]
                            if not self.is_room_suitable(room, b, subj, day, slots):
                                continue
                            if not self.is_faculty_available(fid, day, slots, subj, b):
                                continue
                            if not self.is_batch_available(b_id, day, slots):
                                continue
                            # assign it
                            self.assign(b_id, subj_id, fid, room['id'], day, slots)
                            assignment.append((b_id, subj_id, {'day': day, 'slot': slots, 'room_id': room['id'], 'faculty_id': fid}))
                            placed = True
                            break
                        if placed:
                            break
                    if placed:
                        break
                if not placed:
                    self.conflict_counts['unplaced_subject'] += 1

        score = - sum(int(v) for v in self.conflict_counts.values())
        sol = {'assignment': assignment, 'score': score}
        self.solutions = [sol]
        return self.solutions
