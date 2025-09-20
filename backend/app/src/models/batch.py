# timetable_scheduler/models/batch.py

class Batch:
    def __init__(self, id, name, semester, strength, subjects, parent_batch=None, lab_slot=None, working_days=None,**kwargs):
        """
        Initialize a batch or lab sub-batch.

        Args:
            id (str): Unique batch ID.
            name (str): Name of batch (e.g., "IT Sem 3 - Section A").
            semester (int): Semester number.
            strength (int): Number of students in batch.
            subjects (list): List of subject IDs assigned to this batch.
            parent_batch (str): Optional, parent batch ID if this is a lab sub-batch.
            lab_slot (dict or str): Optional lab slot info (start_slot, duration_slots)
            working_days (list): Optional list of working days
            Extra keys from JSON (like _comment) are ignored using **kwargs.
        """
        self.id = id
        self.name = name
        self.semester = semester
        self.strength = strength
        self.subjects = subjects
        self.parent_batch = parent_batch

        # Track assigned timetable: {day: {slot: subject_id}}
        self.working_days = working_days if working_days else ["Mon", "Tue", "Wed", "Thu", "Fri"]
        self.schedule = {day: {} for day in self.working_days}

        # Lab slot info for this batch (if lab)
        self.lab_slot = lab_slot  # e.g., {'start_slot': '4', 'duration_slots': 2} or 'fixed_lab_slot'

    def get_lab_slot(self):
        """
        Return the start_slot and duration_slots if this is a lab sub-batch.
        """
        if isinstance(self.lab_slot, dict):
            return self.lab_slot.get("start_slot"), self.lab_slot.get("duration_slots")
        return None, None

    def is_available(self, day, slot, duration=1):
        """
        Check if batch is available for the given day and slot(s).
        """
        for i in range(duration):
            check_slot = str(int(slot) + i)
            if check_slot in self.schedule.get(day, {}):
                return False
        return True

    def assign_subject(self, day, slot, subject_id, duration=1):
        """
        Assign a subject to this batch for specific day/slot(s).
        Returns True if successful, False if conflict occurs.
        """
        if not self.is_available(day, slot, duration):
            return False

        for i in range(duration):
            self.schedule[day][str(int(slot) + i)] = subject_id
        return True

    def unassign_subject(self, day, slot, duration=1):
        """
        Remove a subject assignment from the batch.
        """
        for i in range(duration):
            check_slot = str(int(slot) + i)
            if check_slot in self.schedule.get(day, {}):
                del self.schedule[day][check_slot]

    def get_schedule(self):
        """
        Return full timetable schedule for this batch.
        """
        return self.schedule

    def __repr__(self):
        parent_info = f", parent_batch={self.parent_batch}" if self.parent_batch else ""
        return f"<Batch id={self.id}, name={self.name}, semester={self.semester}, strength={self.strength}{parent_info}>"
