import json

# --- 1. Load Data ---
with open('demo_data.json', 'r') as f:
    data = json.load(f)

FACULTIES = {f['id']: f for f in data['faculties']}
COURSES = {c['id']: c for c in data['courses']}
CLASSROOMS = {r['id']: r for r in data['classrooms']}
TIME_SLOTS = data['time_slots']
BATCHES = {b['id']: b for b in data['batches']}
ALL_COURSE_IDS = list(COURSES.keys())

# --- 2. Constraint Checking ---

def is_valid_assignment(new_event, timetable):
    course = COURSES[new_event['course_id']]
    faculty = FACULTIES[new_event['faculty_id']]
    batch = BATCHES[course['batch_id']]
    room = CLASSROOMS[new_event['room_id']]

    for event in timetable:
        # --- Clash constraints ---
        if event['day'] == new_event['day'] and event['time_slot'] == new_event['time_slot']:
            if event['faculty_id'] == new_event['faculty_id']:
                return False  # Faculty clash
            if event['room_id'] == new_event['room_id']:
                return False  # Room clash
            if COURSES[event['course_id']]['batch_id'] == batch['id']:
                return False  # Student batch clash

    # --- Room capacity constraint ---
    if room['capacity'] < batch['size']:
        return False

    # --- Faculty availability ---
    for unavailability in faculty.get('unavailability', []):
        if unavailability['day'] == new_event['day'] and unavailability['time_slot'] == new_event['time_slot']:
            return False

    # --- Fixed slot (if course has one) ---
    if course.get('fixed_slot'):
        if (new_event['day'], new_event['time_slot']) != tuple(course['fixed_slot']):
            return False

    # --- Max hours per day (faculty & student) ---
    faculty_hours = sum(1 for ev in timetable if ev['faculty_id'] == faculty['id'] and ev['day'] == new_event['day'])
    student_hours = sum(1 for ev in timetable if COURSES[ev['course_id']]['batch_id'] == batch['id'] and ev['day'] == new_event['day'])
    if faculty_hours >= faculty.get('max_hours_per_day', 4):
        return False
    if student_hours >= batch.get('max_hours_per_day', 6):
        return False

    # --- Department/shift boundaries + semester-specific rules ---
    sem_rule = batch.get('shift_rule')  # e.g., {"lectures":"morning","labs":"afternoon"}
    if sem_rule:
        if course['type'] == 'lecture' and new_event['shift'] != sem_rule['lectures']:
            return False
        if course['type'] == 'lab' and new_event['shift'] != sem_rule['labs']:
            return False

    # --- Special room allocation ---
    if course.get('required_room_type') and room['type'] != course['required_room_type']:
        return False

    # --- Room maintenance handling ---
    for m in room.get('maintenance', []):
        if m['day'] == new_event['day'] and m['time_slot'] == new_event['time_slot']:
            return False

    return True

# --- 3. Faculty substitution ---
def find_alternate_faculty(course, day, time_slot):
    for fid in course.get('alternate_faculties', []):
        fac = FACULTIES[fid]
        if all(not (u['day']==day and u['time_slot']==time_slot) for u in fac.get('unavailability', [])):
            return fid
    return None

# --- 4. Backtracking Solver ---
def solve_timetable(course_index, timetable):
    if course_index >= len(ALL_COURSE_IDS):
        return timetable

    course_id = ALL_COURSE_IDS[course_index]
    course = COURSES[course_id]
    faculty_id = course['faculty_id']

    for time_slot in TIME_SLOTS:
        for room_id, room in CLASSROOMS.items():
            new_event = {
                "course_id": course_id,
                "faculty_id": faculty_id,
                "room_id": room_id,
                "day": time_slot['day'],
                "time_slot": time_slot['time_slot'],
                "shift": time_slot['shift']
            }

            if is_valid_assignment(new_event, timetable):
                timetable.append(new_event)
                solution = solve_timetable(course_index+1, timetable)
                if solution:
                    return solution
                timetable.pop()
            else:
                # Try alternate faculty if original is on leave
                alt_faculty = find_alternate_faculty(course, time_slot['day'], time_slot['time_slot'])
                if alt_faculty:
                    new_event['faculty_id'] = alt_faculty
                    if is_valid_assignment(new_event, timetable):
                        timetable.append(new_event)
                        solution = solve_timetable(course_index+1, timetable)
                        if solution:
                            return solution
                        timetable.pop()

    return None

# --- 5. Run Solver ---
if __name__ == "__main__":
    timetable = solve_timetable(0, [])
    if timetable:
        print("\n--- Timetable Found ---")
        for ev in timetable:
            course = COURSES[ev['course_id']]['name']
            fac = FACULTIES[ev['faculty_id']]['name']
            room = CLASSROOMS[ev['room_id']]['name']
            print(f"{ev['day']} {ev['time_slot']} ({ev['shift']}): {course} - {fac} in {room}")
    else:
        print("No valid timetable could be generated")
