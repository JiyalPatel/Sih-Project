# timetable_scheduler/models/timetable.py

class Timetable:
    def __init__(self, semesters, working_days, slots, fixed_lab_slots=None, **kwargs):
        """
        Initialize the Timetable.

        Args:
            semesters (list): List of semester numbers, e.g., [3, 5, 7]
            working_days (list): List of days, e.g., ["Mon", "Tue", "Wed", "Thu", "Fri"]
            slots (dict): Slot mapping, e.g., {"1": "10:30-11:30", ...}
            fixed_lab_slots (dict): Optional fixed lab slots per semester, e.g.,
                {"3": {"start_slot": "4", "duration_slots": 2}}
        """
        self.semesters = semesters
        self.working_days = working_days
        self.slots = slots
        self.fixed_lab_slots = fixed_lab_slots if fixed_lab_slots else {}

        # Structure: {semester: {day: {slot: {"batch_id": ..., "subject_id": ..., "faculty_id": ..., "classroom_id": ...}}}}
        self.schedule = {
            sem: {day: {slot: None for slot in slots.keys()} for day in working_days} 
            for sem in semesters
        }

    def is_slot_free(self, semester, day, slot):
        """Check if a slot is free for a semester."""
        return self.schedule[semester][day][slot] is None

    def assign_class(self, semester, day, slot, batch_id, subject_id, faculty_id, classroom_id, duration=1, is_lab=False):
        """
        Assign a class or lab to the timetable.

        Args:
            semester (int)
            day (str)
            slot (str)
            batch_id (str)
            subject_id (str)
            faculty_id (str)
            classroom_id (str)
            duration (int): Number of consecutive slots (for labs)
            is_lab (bool): True if this is a lab (apply fixed lab slot if needed)
        Returns:
            bool: True if assignment successful, False if any slot is occupied
        """
        # For labs, override slot and duration if fixed lab slot exists
        if is_lab and str(semester) in self.fixed_lab_slots:
            fixed = self.fixed_lab_slots[str(semester)]
            slot = fixed["start_slot"]
            duration = fixed["duration_slots"]

        # Check all slots for availability
        for i in range(duration):
            check_slot = str(int(slot) + i)
            if not self.is_slot_free(semester, day, check_slot):
                return False

        # Assign to all slots
        for i in range(duration):
            check_slot = str(int(slot) + i)
            self.schedule[semester][day][check_slot] = {
                "batch_id": batch_id,
                "subject_id": subject_id,
                "faculty_id": faculty_id,
                "classroom_id": classroom_id
            }
        return True

    def unassign_class(self, semester, day, slot, duration=1):
        """Remove class/lab assignment from slot(s)."""
        for i in range(duration):
            check_slot = str(int(slot) + i)
            self.schedule[semester][day][check_slot] = None

    def get_semester_schedule(self, semester):
        """Return full schedule for a semester."""
        return self.schedule.get(semester, {})

    def to_json(self):
        """Return schedule in JSON-serializable format."""
        return self.schedule

    def __repr__(self):
        return f"<Timetable semesters={self.semesters}, days={len(self.working_days)}, slots={len(self.slots)}>"
