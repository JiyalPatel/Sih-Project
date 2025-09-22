
import hashlib, json

class Timetable:
    def __init__(self, semesters=None, working_days=None, slots=None, fixed_lab_slots=None, **kwargs):
        self.semesters = list(semesters) if semesters is not None else []
        self.working_days = list(working_days) if working_days is not None else []
        self.slots = list(slots) if slots is not None else []
        # structure: semester -> day -> slot -> list of assignments
        self.schedule = {sem: {d: {s: [] for s in self.slots} for d in self.working_days} for sem in self.semesters}
        self.fixed_lab_slots = fixed_lab_slots or {}
        self.metadata = {}

    def _slot_sequence(self, start_slot, duration):
        try:
            start = int(start_slot)
        except Exception:
            raise ValueError("slot ids must be numeric strings for consecutive assignment")
        seq = [str(start + i) for i in range(duration)]
        for s in seq:
            if s not in self.slots:
                raise ValueError(f"slot {s} not in timetable slots")
        return seq

    def assign(self, semester, day, start_slot, assignment):
        duration = int(assignment.get('duration', 1))
        seq = self._slot_sequence(start_slot, duration)
        if semester not in self.schedule:
            return False, "invalid semester"
        if day not in self.schedule[semester]:
            return False, "invalid day"
        for s in seq:
            self.schedule[semester][day][s].append(assignment.copy())
        return True, None

    def signature(self):
        parts = []
        for sem in sorted(self.schedule.keys()):
            for d in sorted(self.schedule[sem].keys()):
                for s in sorted(self.schedule[sem][d].keys(), key=lambda x: int(x) if str(x).isdigit() else x):
                    assigns = self.schedule[sem][d][s]
                    for a in assigns:
                        parts.append(f"{sem}|{d}|{s}|{a.get('batch')}|{a.get('room')}|{a.get('subject')}")
        sig = "|".join(parts)
        return hashlib.sha256(sig.encode('utf-8')).hexdigest()

    def to_json(self):
        return json.dumps(self.schedule)
