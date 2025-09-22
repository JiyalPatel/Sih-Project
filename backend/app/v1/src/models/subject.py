# timetable_scheduler/models/subject.py

class Subject:
    def __init__(self, id, name, type, credits, semester, hours_per_week, preferred_days=None, preferred_slots=None, lab_slot=None, **kwargs):
        """
        Initialize a subject.

        Args:
            id (str): Unique subject ID.
            name (str): Subject name.
            type (str): 'theory' or 'lab'.
            credits (int): Credit hours.
            semester (int): Semester number.
            hours_per_week (int): Total hours per week.
            preferred_days (list): Optional preferred days for lectures/labs.
            preferred_slots (list): Optional preferred slots.
            lab_slot (dict or str): If lab, indicates fixed slot assignment (start_slot, duration_slots)
        """
        self.id = id
        self.name = name
        self.type = type
        self.credits = credits
        self.semester = semester
        self.hours_per_week = hours_per_week
        self.preferred_days = preferred_days if preferred_days else []
        self.preferred_slots = preferred_slots if preferred_slots else []
        self.lab_slot = lab_slot  # e.g., {'start_slot': '4', 'duration_slots': 2} or 'fixed_lab_slot'

        # Track assigned batches: {batch_id: [(day, slot)]}
        self.assigned_batches = {}

    def assign_to_batch(self, batch_id, day, slot):
        """
        Assign this subject to a batch at a specific day and slot.
        """
        if batch_id not in self.assigned_batches:
            self.assigned_batches[batch_id] = []
        self.assigned_batches[batch_id].append((day, slot))

    def unassign_from_batch(self, batch_id, day, slot):
        """
        Remove assignment for batch.
        """
        if batch_id in self.assigned_batches:
            if (day, slot) in self.assigned_batches[batch_id]:
                self.assigned_batches[batch_id].remove((day, slot))
            if not self.assigned_batches[batch_id]:
                del self.assigned_batches[batch_id]

    def get_assigned_batches(self):
        """
        Returns the current assignments for all batches.
        """
        return self.assigned_batches

    def is_lab(self):
        """
        Returns True if subject is a lab.
        """
        return self.type.lower() == 'lab'

    def is_theory(self):
        """
        Returns True if subject is a theory lecture.
        """
        return self.type.lower() == 'theory'

    def __repr__(self):
        return f"<Subject id={self.id}, name={self.name}, type={self.type}, semester={self.semester}>"
