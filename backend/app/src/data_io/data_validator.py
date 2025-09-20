class DataValidator:
    def __init__(self, batches, subjects, faculty, classrooms, constraints):
        self.batches = batches
        self.subjects = subjects
        self.faculty = faculty
        self.classrooms = classrooms
        self.constraints = constraints

    # ----------------------------
    # Validate all advanced rules
    # ----------------------------
    def validate_all(self):
        self.validate_batch_subjects()
        self.validate_faculty_subjects()
        self.validate_classroom_capacity()
        self.validate_lab_batches()
        self.validate_subject_hours()
        print("Advanced data validation passed successfully.")

    # ----------------------------
    # Check batch subjects exist
    # ----------------------------
    def validate_batch_subjects(self):
        subject_ids = {s['id'] for s in self.subjects}
        for batch in self.batches:
            for subj in batch['subjects']:
                if subj not in subject_ids:
                    raise Exception(f"Batch {batch['id']} references unknown subject {subj}")

    # ----------------------------
    # Check faculty subjects exist
    # ----------------------------
    def validate_faculty_subjects(self):
        subject_ids = {s['id'] for s in self.subjects}
        for fac in self.faculty:
            for subj in fac.get('subjects', []):
                if subj not in subject_ids:
                    raise Exception(f"Faculty {fac['id']} references unknown subject {subj}")

    # ----------------------------
    # Check classroom/lab capacities
    # ----------------------------
    def validate_classroom_capacity(self):
        # Map classroom by id
        room_dict = {r['id']: r for r in self.classrooms}
        for batch in self.batches:
            for subj_id in batch['subjects']:
                subj = next((s for s in self.subjects if s['id'] == subj_id), None)
                if not subj:
                    continue
                if subj['type'] == 'lab':
                    # Labs may have sub-batches
                    if 'parent_batch' in batch:
                        if batch['strength'] > max([r['capacity'] for r in self.classrooms if r['type'] == 'lab']):
                            raise Exception(f"Lab batch {batch['id']} exceeds available lab capacity")
                elif subj['type'] == 'theory':
                    if batch['strength'] > max([r['capacity'] for r in self.classrooms if r['type'] == 'lecture']):
                        raise Exception(f"Lecture batch {batch['id']} exceeds available classroom capacity")

    # ----------------------------
    # Check lab sub-batches properly split
    # ----------------------------
    def validate_lab_batches(self):
        for batch in self.batches:
            if 'parent_batch' in batch:
                parent = next((b for b in self.batches if b['id'] == batch['parent_batch']), None)
                if not parent:
                    raise Exception(f"Lab batch {batch['id']} has invalid parent batch {batch['parent_batch']}")
                if batch['semester'] != parent['semester']:
                    raise Exception(f"Lab batch {batch['id']} semester mismatch with parent batch {parent['id']}")

    # ----------------------------
    # Check subject hours consistency
    # ----------------------------
    def validate_subject_hours(self):
        for subj in self.subjects:
            if subj['hours_per_week'] <= 0:
                raise Exception(f"Subject {subj['id']} has invalid hours per week: {subj['hours_per_week']}")
