
class Batch:
    def __init__(self, id, name=None, semester=None, strength=0, subjects=None, parent_batch=None, is_subgroup=False, available_days=None, available_slots=None, **kwargs):
        self.id = id
        self.name = name or id
        self.semester = semester
        self.strength = int(strength or 0)
        self.subjects = list(subjects) if subjects is not None else []
        self.parent_batch = parent_batch
        self.is_subgroup = bool(is_subgroup)
        self.available_days = list(available_days) if available_days is not None else []
        self.available_slots = list(available_slots) if available_slots is not None else []
        # schedule: day -> slot -> list of assignments
        self.schedule = {d: {s: [] for s in self.available_slots} for d in self.available_days}

    def is_available(self, day, start_slot, duration=1):
        if day not in self.available_days:
            return False
        try:
            start = int(start_slot)
        except Exception:
            return False
        seq = [str(start + i) for i in range(duration)]
        for s in seq:
            if s not in self.available_slots:
                return False
            if self.schedule.get(day, {}).get(s):
                return False
        return True

    def assign(self, day, start_slot, value):
        duration = int(value.get('duration',1))
        if not self.is_available(day, start_slot, duration):
            return False, "batch not available for all slots"
        start = int(start_slot)
        seq = [str(start + i) for i in range(duration)]
        for s in seq:
            self.schedule[day][s].append(value.copy())
        return True, None

    def unassign(self, day, start_slot, value=None):
        duration = int(value.get('duration',1)) if value else 1
        start = int(start_slot)
        seq = [str(start + i) for i in range(duration)]
        for s in seq:
            if value is None:
                self.schedule[day][s] = []
            else:
                try:
                    self.schedule[day][s].remove(value)
                except ValueError:
                    pass
