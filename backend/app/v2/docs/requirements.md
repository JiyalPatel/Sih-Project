# Requirements & Data Format

- Place JSON files into `data/`:
  - classrooms.json, faculty.json, subjects.json, batches.json, timetable_constraints.json
- `demo_data.json` is a combined file used by demo runner.

Fields expected (brief):
- Classroom: id, name, type (lecture|lab), capacity, available_days, available_slots
- Faculty: id, name, subjects (list of subject ids), max_hours_per_week, preferred_days, preferred_slots
- Subject: id, name, lab (bool), duration_slots, hours_per_week, semester
- Batch: id, name, semester, strength, subjects, available_days, available_slots
- Timetable constraints: general_settings (slots_per_day, working_days), combine_semesters, random_seed, time_limit, max_solutions, top_k
