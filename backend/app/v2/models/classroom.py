
class Classroom:
    def __init__(self, id, type="lecture", capacity=0, name=None, available_days=None, available_slots=None, lab_slots=None, **kwargs):
        self.id = id
        self.name = name or id
        self.type = type or "lecture"
        self.capacity = int(capacity or 0)
        self.available_days = list(available_days) if available_days is not None else []
        self.available_slots = list(available_slots) if available_slots is not None else []
        self.lab_slots = lab_slots or {}
        # schedule: day -> slot -> list of assignments (allow checking conflicts)
        self.schedule = {d: {s: [] for s in self.available_slots} for d in self.available_days}

    def is_lab(self):
        return self.type == "lab"

    def _slot_sequence(self, start_slot, duration):
        try:
            start = int(start_slot)
        except Exception:
            raise ValueError("slot ids must be numeric strings for consecutive assignment")
        seq = [str(start + i) for i in range(duration)]
        for s in seq:
            if s not in self.available_slots:
                raise ValueError(f"slot {s} not available in room {self.id}")
        return seq

    def is_available(self, day, start_slot, duration=1):
        if day not in self.available_days:
            return False
        try:
            seq = self._slot_sequence(start_slot, duration)
        except Exception:
            return False
        # availability: no other assignments in any of the seq slots
        for s in seq:
            if self.schedule.get(day, {}).get(s):
                return False
        return True

    def assign(self, day, start_slot, value):
        # value expected to be dict with 'duration' and optional 'batch_size'
        duration = int(value.get('duration', 1))
        if not self.is_available(day, start_slot, duration):
            return False, "room not available for all slots"
        batch_size = int(value.get('batch_size', 0)) if isinstance(value, dict) else 0
        if batch_size and self.capacity < batch_size:
            return False, f"room capacity {self.capacity} < batch size {batch_size}"
        seq = self._slot_sequence(start_slot, duration)
        for s in seq:
            self.schedule[day][s].append(value.copy())
        return True, None

    def unassign(self, day, start_slot=None, value=None):
        if start_slot is None:
            # clear all slots for day
            for s in self.schedule.get(day, {}):
                self.schedule[day][s] = []
            return
        duration = int(value.get('duration',1)) if value else 1
        seq = self._slot_sequence(start_slot, duration)
        for s in seq:
            if value is None:
                self.schedule[day][s] = []
            else:
                try:
                    self.schedule[day][s].remove(value)
                except ValueError:
                    pass
