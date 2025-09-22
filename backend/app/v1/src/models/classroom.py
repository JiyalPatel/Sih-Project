# timetable_scheduler/models/classroom.py

class Classroom:
    def __init__(self, id, name, type, capacity, available_days, available_slots, lab_slots=None, **kwargs):
        """
        Initialize a classroom/lab.

        Args:
            id (str): Unique classroom/lab ID.
            name (str): Human-readable name.
            type (str): 'lecture' or 'lab'.
            capacity (int): Maximum number of students.
            available_days (list): List of working days, e.g., ["Mon", "Tue"].
            available_slots (list): List of available slots, e.g., ["1", "2", "3"] or ["9-11"]
            lab_slots (dict): Optional fixed lab slots per semester, e.g.,
            
                {"3": {"start_slot": "4", "duration_slots": 2}}
                Extra keys from JSON (like _comment) are ignored using **kwargs.
        """
        self.id = id
        self.name = name
        self.type = type.lower()
        self.capacity = capacity
        self.available_days = available_days
        self.available_slots = available_slots
        self.lab_slots = lab_slots if lab_slots else {}

        # Maintain current schedule: {day: {slot: batch_id}}
        self.schedule = {day: {} for day in available_days}

    def is_available(self, day, slot, duration=1, semester=None, is_lab=False):
        """
        Check if classroom is free on a specific day and slot(s).
        Supports multi-slot assignments for labs.

        Args:
            day (str): Day to check.
            slot (str): Starting slot.
            duration (int): Number of consecutive slots required.
            semester (int): Semester number (for lab)
            is_lab (bool): True if checking for a lab
        Returns:
            bool: True if all slots are free.
        """
        if day not in self.available_days:
            return False

        # Override slot and duration for lab
        if is_lab and semester and str(semester) in self.lab_slots:
            fixed = self.lab_slots[str(semester)]
            slot = fixed["start_slot"]
            duration = fixed["duration_slots"]

        for i in range(duration):
            check_slot = str(int(slot) + i) if slot.isdigit() else slot
            if check_slot in self.schedule[day]:
                return False
        return True

    def assign_batch(self, day, slot, batch_id, duration=1, semester=None, is_lab=False):
        """
        Assign a batch to this classroom for a specific day and slot(s).
        Returns True if assignment successful, False if conflict exists.

        Args:
            day (str)
            slot (str)
            batch_id (str)
            duration (int)
            semester (int): Semester number (for lab)
            is_lab (bool): True if this is a lab
        """
        if not self.is_available(day, slot, duration, semester, is_lab):
            return False

        # Override slot and duration for lab
        if is_lab and semester and str(semester) in self.lab_slots:
            fixed = self.lab_slots[str(semester)]
            slot = fixed["start_slot"]
            duration = fixed["duration_slots"]

        for i in range(duration):
            check_slot = str(int(slot) + i) if slot.isdigit() else slot
            self.schedule[day][check_slot] = batch_id
        return True

    def unassign_batch(self, day, slot, duration=1, semester=None, is_lab=False):
        """
        Remove a batch assignment from the room.

        Args:
            day (str)
            slot (str)
            duration (int)
            semester (int): Semester number (for lab)
            is_lab (bool): True if this is a lab
        """
        if is_lab and semester and str(semester) in self.lab_slots:
            fixed = self.lab_slots[str(semester)]
            slot = fixed["start_slot"]
            duration = fixed["duration_slots"]

        for i in range(duration):
            check_slot = str(int(slot) + i) if slot.isdigit() else slot
            if check_slot in self.schedule.get(day, {}):
                del self.schedule[day][check_slot]

    def get_schedule(self):
        """
        Return full schedule for this room.
        """
        return self.schedule

    def __repr__(self):
        return f"<Classroom id={self.id}, name={self.name}, type={self.type}, capacity={self.capacity}>"
