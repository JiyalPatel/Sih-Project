import json
from collections import defaultdict

# ------------------------------
# Load Input Data
# ------------------------------

with open('demo_data.json', 'r') as f:
    data = json.load(f)

faculties = {f['id']: f for f in data['faculties']}
courses = {c['id']: c for c in data['courses']}
rooms = {r['id']: r for r in data['classrooms']}
time_slots = data['time_slots']

# ------------------------------
# Constraint Functions
# ------------------------------

def is_faculty_available(faculty_id, ts_idx):
    faculty = faculties[faculty_id]
    unavailable = faculty.get('unavailability', [])
    day, slot = time_slots[ts_idx]['day'], time_slots[ts_idx]['time_slot']
    for entry in unavailable:
        if entry['day'] == day and entry['time_slot'] == slot:
            return False
    return True

def is_room_valid(course_id, room_id):
    course = courses[course_id]
    if 'fixed_room' in course and course['fixed_room'] != room_id:
        return False
    return True

# ------------------------------
# CSP Solver (Backtracking)
# ------------------------------

def solve_timetable(course_list, assignment={}, used_time_room=set(), used_time_faculty=set()):
    if not course_list:
        return assignment
    
    course_id = course_list[0]
    course = courses[course_id]
    faculty_id = course['faculty_id']

    morning_pref = faculties[faculty_id].get('preferences', {}).get('time_of_day') == 'morning'

    valid_ts_idxs = []
    for ts_idx, ts in enumerate(time_slots):
        if not is_faculty_available(faculty_id, ts_idx):
            continue
        if morning_pref and ts['time_slot'] == 'morning':
            valid_ts_idxs.insert(0, ts_idx)
        else:
            valid_ts_idxs.append(ts_idx)
    
    allowed_rooms = [course.get('fixed_room')] if course.get('fixed_room') else list(rooms.keys())
    for room_id in allowed_rooms:
        for ts_idx in valid_ts_idxs:
            key_room = (room_id, ts_idx)
            key_faculty = (faculty_id, ts_idx)
            if key_room in used_time_room or key_faculty in used_time_faculty:
                continue
            if not is_room_valid(course_id, room_id):
                continue
            
            assignment[course_id] = {
                'faculty_id': faculty_id,
                'room_id': room_id,
                'ts_idx': ts_idx
            }
            used_time_room.add(key_room)
            used_time_faculty.add(key_faculty)
            result = solve_timetable(course_list[1:], assignment, used_time_room, used_time_faculty)
            if result:
                return result
            del assignment[course_id]
            used_time_room.remove(key_room)
            used_time_faculty.remove(key_faculty)

    return None

# ------------------------------
# Run Solver & Output Results
# ------------------------------

# Correct: course_order must be a flat list of course IDs (strings)
course_order = list(courses.keys())

solution = solve_timetable(course_order)

if solution:
    print("\nGenerated Timetable (Clash-Free):\n")
    print("Course        Faculty        Room           Day        Time Slot")
    print("-" * 60)
    for cid, slot in solution.items():
        ts_info = time_slots[slot['ts_idx']]
        print("{:<13} {:<13} {:<14} {:<10} {:<12}".format(
            courses[cid]['name'],
            faculties[slot['faculty_id']]['name'],
            rooms[slot['room_id']]['name'],
            ts_info['day'],
            ts_info['time_slot']
        ))
else:
    print("No valid timetable found for the given constraints.")

# ------------------------------
# Validation Output
# ------------------------------

print("\nValidation Checks:")
for cid, slot in solution.items():
    course = courses[cid]
    faculty = faculties[slot['faculty_id']]
    room = rooms[slot['room_id']]
    ts_info = time_slots[slot['ts_idx']]
    # Faculty unavailability
    unavailable = [
        entry for entry in faculty.get('unavailability', [])
        if entry['day'] == ts_info['day'] and entry['time_slot'] == ts_info['time_slot']
    ]
    if unavailable:
        print(f"ERROR - {faculty['name']} scheduled during unavailable time for {course['name']}")
    # Fixed room check
    if course.get('fixed_room') and room['id'] != course['fixed_room']:
        print(f"ERROR - {course['name']} should be in {rooms[course['fixed_room']]['name']}, got {room['name']}")
    print(f"{course['name']}: {faculty['name']} @ {room['name']} on {ts_info['day']} {ts_info['time_slot']}")
print("\n-- All core constraints validated. --\n")
