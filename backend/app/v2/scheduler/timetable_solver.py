
import copy, random, time, os, importlib.util

class TimetableSolver:
    def __init__(self, slots, working_days, classrooms_map, faculty_map, batches_map, subjects_map, random_seed=42, time_limit=120):
        self.slots = list(slots)
        self.working_days = list(working_days)
        self.classrooms = classrooms_map
        self.faculty = faculty_map
        self.batches = batches_map
        self.subjects = subjects_map
        self.random_seed = int(random_seed) if random_seed is not None else int(time.time())
        self.time_limit = time_limit
        self.start_time = None
        # load timetable module once
        timetable_path = os.path.join(os.path.dirname(__file__), "timetable.py")
        spec = importlib.util.spec_from_file_location("timetable_module", timetable_path)
        self.timetable_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.timetable_module)

    def _time_left(self):
        return (time.time() - self.start_time) < self.time_limit

    def _slot_seq(self, start_slot, duration):
        try:
            start = int(start_slot)
        except Exception:
            return []
        seq = [str(start + i) for i in range(duration)]
        if any(s not in self.slots for s in seq):
            return []
        return seq

    def _generate_sessions(self, batches_map):
        sessions = []
        for bid, b in batches_map.items():
            for subj_id in getattr(b, "subjects", []):
                subj = self.subjects.get(subj_id)
                if subj is None:
                    continue
                import math
                hours = getattr(subj, "hours_per_week", 0) or 0
                dur = getattr(subj, "duration_slots", 1) or 1
                if hours > 0:
                    # Use ceil so we always schedule at least the required hours
                    sessions_per_week = max(1, int(math.ceil(hours / dur)))
                else:
                    sessions_per_week = 1

                for i in range(sessions_per_week):
                    sessions.append({
                        "batch": bid,
                        "subject": subj_id,
                        "semester": getattr(b, 'semester', None),
                        "duration": dur,
                        "batch_size": getattr(b, 'strength', 0),
                        "is_lab": subj.is_lab() if hasattr(subj, 'is_lab') else bool(subj.get('lab', False))
                    })
        sessions.sort(key=lambda x: (0 if x['is_lab'] else 1, -x['batch_size']))
        return sessions

    def _generate_domain(self, session, rooms, facs, batches):
        candidates = []
        dur = int(session['duration'])
        batch_obj = batches[session['batch']]
        subj = self.subjects.get(session['subject'])
        needed_type = "lab" if session['is_lab'] else "lecture"
        possible_rooms = [r for r in rooms.values() if r.type == needed_type and r.capacity >= session['batch_size']]
        possible_facs = [f for f in facs.values() if session['subject'] in getattr(f, 'subjects', [])]
        if not possible_rooms or not possible_facs:
            return []
        days = [d for d in batch_obj.available_days if d in self.working_days] if getattr(batch_obj, 'available_days', None) else list(self.working_days)
        slot_ids = self.slots
        for day in days:
            for start in slot_ids:
                seq = self._slot_seq(start, dur)
                if not seq:
                    continue
                for room in possible_rooms:
                    try:
                        if not room.is_available(day, start, dur):
                            continue
                    except Exception:
                        continue
                    for fac in possible_facs:
                        try:
                            if not fac.is_available(day, start, dur):
                                continue
                        except Exception:
                            continue
                        try:
                            if not batch_obj.is_available(day, start, dur):
                                continue
                        except Exception:
                            continue
                        candidates.append((room.id, fac.id, day, start))
        random.shuffle(candidates)
        return candidates

    def score(self, timetable):
        sc = 0
        for sem in timetable.schedule:
            for day in timetable.schedule[sem]:
                for s in timetable.schedule[sem][day]:
                    assigns = timetable.schedule[sem][day][s]
                    for a in assigns:
                        fac = self.faculty.get(a.get('faculty'))
                        if fac and (s in getattr(fac, 'preferred_slots', [])) and (day in getattr(fac, 'preferred_days', [])):
                            sc += 2
                        room = self.classrooms.get(a.get('room'))
                        if room and a.get('batch_size', 0):
                            util = a.get('batch_size') / (room.capacity if room.capacity else 1)
                            if util >= 0.7:
                                sc += 1
        return sc

    def solve(self, sessions, max_solutions=5):
        self.start_time = time.time()
        results = []
        seen_sigs = set()
        attempts = 0
        max_attempts = max(1, max_solutions * 20)
        base_seed = self.random_seed
        while len(results) < max_solutions and (time.time() - self.start_time) < self.time_limit and attempts < max_attempts:
            seed = base_seed + attempts
            random.seed(seed)
            res = self._solve_single_attempt(sessions, seed)
            attempts += 1
            if res:
                sig = res['timetable'].signature()
                if sig not in seen_sigs:
                    seen_sigs.add(sig)
                    res['signature'] = sig
                    results.append(res)
        results.sort(key=lambda x: x['score'], reverse=True)
        return results

    def _solve_single_attempt(self, sessions, seed):
        random.seed(seed)
        rooms = {rid: copy.deepcopy(r) for rid, r in self.classrooms.items()}
        facs = {fid: copy.deepcopy(f) for fid, f in self.faculty.items()}
        batches = {bid: copy.deepcopy(b) for bid, b in self.batches.items()}
        tt = self.timetable_module.Timetable(semesters=sorted(list(set([s['semester'] for s in sessions]))),
                                             working_days=self.working_days, slots=self.slots)
        order = list(range(len(sessions)))

        def backtrack(idx):
            if (time.time() - self.start_time) >= self.time_limit:
                return False
            if idx >= len(order):
                return True
            si = order[idx]
            sess = sessions[si]
            domain = self._generate_domain(sess, rooms, facs, batches)
            for room_id, fac_id, day, start in domain:
                room = rooms[room_id]; fac = facs[fac_id]; batch = batches[sess['batch']]
                assign = {"batch": sess['batch'], "subject": sess['subject'], "faculty": fac_id, "room": room_id,
                          "batch_size": sess['batch_size'], "duration": sess['duration'], "is_lab": sess['is_lab']}
                r_ok, r_err = room.assign(day, start, assign)
                if not r_ok:
                    continue
                f_ok, f_err = fac.assign(day, start, assign)
                if not f_ok:
                    room.unassign(day, start, assign)
                    continue
                b_ok, b_err = batch.assign(day, start, assign)
                if not b_ok:
                    room.unassign(day, start, assign)
                    fac.unassign(day, start, assign)
                    continue
                tt.assign(sess['semester'], day, start, assign)
                ok = backtrack(idx+1)
                if ok:
                    return True
                for i in range(int(sess['duration'])):
                    slot = str(int(start) + i)
                    try:
                        tt.schedule[sess['semester']][day][slot].remove(assign)
                    except Exception:
                        pass
                room.unassign(day, start, assign)
                fac.unassign(day, start, assign)
                batch.unassign(day, start, assign)
            return False

        success = backtrack(0)
        if success:
            return {"timetable": tt, "score": self.score(tt)}
        return None
