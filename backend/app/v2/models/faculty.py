
class Faculty:
    def __init__(self, id, name=None, category=None, subjects=None, max_hours_per_week=0, max_lab_hours=0, max_lecture_hours=0, preferred_days=None, preferred_slots=None, lab_slots=None, **kwargs):
        self.id = id
        self.name = name or id
        self.category = category
        self.subjects = list(subjects) if subjects is not None else []
        self.max_hours_per_week = int(max_hours_per_week or 0)
        self.max_lab_hours = int(max_lab_hours or 0)
        self.max_lecture_hours = int(max_lecture_hours or 0)
        self.preferred_days = list(preferred_days) if preferred_days is not None else []
        self.preferred_slots = list(preferred_slots) if preferred_slots is not None else []
        self.lab_slots = lab_slots or {}
        # tracking assigned hours and schedule: day -> slot -> list of assignments
        self.assigned_hours = 0
        self.assigned_lab_hours = 0
        self.assigned_lecture_hours = 0
        self.schedule = {d: {s: [] for s in self.preferred_slots} for d in self.preferred_days}

    def can_teach(self, subject_id):
        return subject_id in self.subjects

    def _slot_sequence(self, start_slot, duration):
        try:
            start = int(start_slot)
        except Exception:
            raise ValueError("slot ids must be numeric strings for consecutive assignment")
        seq = [str(start + i) for i in range(duration)]
        for s in seq:
            if s not in self.preferred_slots:
                raise ValueError(f"slot {s} not preferred/available for faculty {self.id}")
        return seq

    def is_available(self, day, start_slot, duration=1):
        if day not in self.preferred_days:
            return False
        try:
            seq = self._slot_sequence(start_slot, duration)
        except Exception:
            return False
        for s in seq:
            if self.schedule.get(day, {}).get(s):
                return False
        return True

    def assign(self, day, start_slot, value):
        duration = int(value.get('duration', 1))
        is_lab = bool(value.get('is_lab', False))
        if not self.is_available(day, start_slot, duration):
            return False, "faculty not available for all slots"
        if self.assigned_hours + duration > self.max_hours_per_week:
            return False, f"assigning {duration} exceeds faculty max hours ({self.assigned_hours}/{self.max_hours_per_week})"
        if is_lab and (self.assigned_lab_hours + duration > self.max_lab_hours):
            return False, f"assigning lab {duration} exceeds faculty max lab hours ({self.assigned_lab_hours}/{self.max_lab_hours})"
        if not is_lab and (self.assigned_lecture_hours + duration > self.max_lecture_hours):
            return False, f"assigning lecture {duration} exceeds faculty max lecture hours ({self.assigned_lecture_hours}/{self.max_lecture_hours})"
        seq = self._slot_sequence(start_slot, duration)
        for s in seq:
            self.schedule[day][s].append(value.copy())
        self.assigned_hours += duration
        if is_lab:
            self.assigned_lab_hours += duration
        else:
            self.assigned_lecture_hours += duration
        return True, None

    def unassign(self, day, start_slot, value=None):
        duration = int(value.get('duration',1)) if value else 1
        is_lab = bool(value.get('is_lab', False)) if value else False
        seq = [str(int(start_slot) + i) for i in range(duration)]
        for s in seq:
            if value is None:
                vals = self.schedule[day][s]
                for v in vals:
                    dur = int(v.get('duration',1)) if isinstance(v, dict) else 1
                    self.assigned_hours -= dur
                self.schedule[day][s] = []
            else:
                try:
                    self.schedule[day][s].remove(value)
                    self.assigned_hours -= duration
                    if is_lab:
                        self.assigned_lab_hours -= duration
                    else:
                        self.assigned_lecture_hours -= duration
                except ValueError:
                    pass
