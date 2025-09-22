# timetable_scheduler/models/faculty.py

class Faculty:
    def __init__(self, id, name, subjects, preferred_days=None, preferred_slots=None, max_hours_per_week=20, lab_slots=None, **kwargs):
        """
        Initialize a faculty member.

        Args:
            id (str): Unique identifier.
            name (str): Faculty name.
            subjects (list): List of subject IDs the faculty can teach.
            preferred_days (list): Optional preferred working days, e.g., ["Mon", "Wed"].
            preferred_slots (list): Optional preferred slot numbers, e.g., ["1", "2", "3"].
            max_hours_per_week (int): Maximum teaching hours per week.
            lab_slots (dict): Optional fixed lab slots per semester, e.g.,
                {"3": {"start_slot": "4", "duration_slots": 2}}
        """
        self.id = id
        self.name = name
        self.subjects = subjects
        self.preferred_days = preferred_days if preferred_days else []
        self.preferred_slots = preferred_slots if preferred_slots else []
        self.max_hours_per_week = max_hours_per_week
        self.lab_slots = lab_slots if lab_slots else {}

        # Track schedule: {day: {slot: subject_id}}
        self.schedule = {day: {} for day in ["Mon", "Tue", "Wed", "Thu", "Fri"]}
        self.hours_assigned = 0

    def is_available(self, day, slot, duration=1, semester=None, is_lab=False):
        """
        Check if faculty is available for the given day and slot(s).

        Args:
            day (str): Day to check.
            slot (str): Starting slot.
            duration (int): Number of consecutive slots (for labs)
            semester (int): Semester of the class/lab (needed for labs)
            is_lab (bool): True if checking availability for a lab
        Returns:
            bool: True if all slots are free and within max hours
        """
        # For labs, override slot and duration if fixed lab slot exists
        if is_lab and semester and str(semester) in self.lab_slots:
            fixed = self.lab_slots[str(semester)]
            slot = fixed["start_slot"]
            duration = fixed["duration_slots"]

        if self.hours_assigned + duration > self.max_hours_per_week:
            return False

        for i in range(duration):
            check_slot = str(int(slot) + i) if slot.isdigit() else slot
            if check_slot in self.schedule.get(day, {}):
                return False
        return True

    def assign_subject(self, day, slot, subject_id, duration=1, semester=None, is_lab=False):
        """
        Assign a subject to this faculty for specific day/slot(s).

        Args:
            day (str)
            slot (str)
            subject_id (str)
            duration (int): Number of consecutive slots (for labs)
            semester (int): Semester number (for lab)
            is_lab (bool): True if this is a lab
        Returns:
            bool: True if assignment successful, False otherwise.
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
            self.schedule[day][check_slot] = subject_id

        self.hours_assigned += duration
        return True

    def unassign_subject(self, day, slot, duration=1, semester=None, is_lab=False):
        """
        Remove a subject assignment.

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

        self.hours_assigned -= duration
        if self.hours_assigned < 0:
            self.hours_assigned = 0

    def get_assigned_schedule(self):
        return self.schedule

    def get_available_slots(self):
        return self.preferred_slots if self.preferred_slots else ["1", "2", "3", "4", "5", "6", "7"]

    def __repr__(self):
        return f"<Faculty id={self.id}, name={self.name}, subjects={self.subjects}, hours_assigned={self.hours_assigned}>"
