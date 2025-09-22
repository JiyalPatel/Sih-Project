# timetable_scheduler/scheduler/constraint_checker.py

from collections import defaultdict

class ConstraintChecker:
    def __init__(self, batches, subjects, faculty, classrooms):
        """
        Initialize the constraint checker.

        Args:
            batches (list[Batch]): Batch objects.
            subjects (list[Subject]): Subject objects.
            faculty (list[Faculty]): Faculty objects.
            classrooms (list[Classroom]): Classroom objects.
        """
        self.batches = {b.id: b for b in batches}
        self.subjects = {s.id: s for s in subjects}
        self.faculty = {f.id: f for f in faculty}
        self.classrooms = {c.id: c for c in classrooms}

    # ----------------------------
    # Check if faculty is available and eligible
    # ----------------------------
    def is_faculty_available(self, faculty_id, day, slot, subject_id, duration=1, semester=None, is_lab=False):
        faculty = self.faculty.get(faculty_id)
        if not faculty:
            return False
        subject = self.subjects.get(subject_id)
        if not subject:
            return False
        if subject_id not in faculty.subjects:
            return False
        return faculty.is_available(day, slot, duration, semester, is_lab)

    # ----------------------------
    # Check if batch is available
    # ----------------------------
    def is_batch_available(self, batch_id, day, slot, duration=1):
        batch = self.batches.get(batch_id)
        if not batch:
            return False
        return batch.is_available(day, slot, duration)

    # ----------------------------
    # Check if classroom is available and suitable
    # ----------------------------
    def is_classroom_available(self, classroom_id, day, slot, batch_id, duration=1, semester=None, is_lab=False):
        classroom = self.classrooms.get(classroom_id)
        batch = self.batches.get(batch_id)
        if not classroom or not batch:
            return False

        # Capacity check
        if is_lab and batch.parent_batch:
            # For lab sub-batch
            if batch.strength > classroom.capacity:
                return False
        elif not is_lab:
            if batch.strength > classroom.capacity:
                return False

        # Availability check
        return classroom.is_available(day, slot, duration, semester, is_lab)

    # ----------------------------
    # Check for any clash: faculty, batch, classroom
    # ----------------------------
    def has_clash(self, day, slot, faculty_id, batch_id, classroom_id, duration=1, semester=None, is_lab=False):
        """
        Return True if any constraint violation occurs for proposed assignment
        """
        for i in range(duration):
            check_slot = str(int(slot) + i)

            # Faculty clash
            if not self.is_faculty_available(faculty_id, day, check_slot, None, 1, semester, is_lab):
                return True

            # Batch clash
            if not self.is_batch_available(batch_id, day, check_slot, 1):
                return True

            # Classroom clash
            if not self.is_classroom_available(classroom_id, day, check_slot, batch_id, 1, semester, is_lab):
                return True

        return False

    # ----------------------------
    # Check all constraints for a proposed class/lab
    # ----------------------------
    def validate_assignment(self, batch_id, subject_id, faculty_id, classroom_id, day, slot, duration=1, semester=None, is_lab=False):
        """
        Returns True if assignment is valid; False otherwise
        """
        # Subject exists
        if subject_id not in self.subjects:
            return False

        # Faculty exists and eligible
        if faculty_id not in self.faculty or subject_id not in self.faculty[faculty_id].subjects:
            return False

        # Batch exists
        if batch_id not in self.batches:
            return False

        # Classroom exists
        if classroom_id not in self.classrooms:
            return False

        # Duration & slot check (within batch/classroom availability)
        if self.has_clash(day, slot, faculty_id, batch_id, classroom_id, duration, semester, is_lab):
            return False

        return True

    # ----------------------------
    # Helper: Check if all lab sub-batches of a batch are properly split
    # ----------------------------
    def validate_lab_sub_batches(self):
        for batch in self.batches.values():
            if batch.parent_batch:
                parent = self.batches.get(batch.parent_batch)
                if not parent:
                    return False
                if batch.semester != parent.semester:
                    return False
        return True

    # ----------------------------
    # Optional: Max hours per week/day for faculty
    # ----------------------------
    def faculty_hours_ok(self, faculty_id, additional_hours=1):
        faculty = self.faculty.get(faculty_id)
        if not faculty:
            return False
        return faculty.hours_assigned + additional_hours <= faculty.max_hours_per_week
