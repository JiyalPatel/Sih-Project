# timetable_scheduler/scheduler/utils.py

from itertools import product

# ----------------------------
# Generate all possible slots for given days and slots per day
# ----------------------------
def generate_all_slots(days, slots_per_day=7):
    """
    Returns a dict of day -> list of slots
    e.g., {'Mon': [1,2,3,4,5,6,7], ...}
    """
    return {day: list(range(1, slots_per_day + 1)) for day in days}

# ----------------------------
# Check if two slot lists overlap
# ----------------------------
def slots_overlap(slots1, slots2):
    """
    Returns True if any slot in slots1 overlaps with slots2
    """
    return bool(set(slots1) & set(slots2))

# ----------------------------
# Flatten a nested timetable dict
# ----------------------------
def flatten_timetable(timetable):
    """
    timetable: dict[batch_id][day][slot] = subject_id
    Returns: list of tuples (batch_id, day, slot, subject_id)
    """
    flat_list = []
    for batch_id, day_map in timetable.items():
        for day, slot_map in day_map.items():
            for slot, subj_id in slot_map.items():
                flat_list.append((batch_id, day, slot, subj_id))
    return flat_list

# ----------------------------
# Deep copy a nested schedule safely
# ----------------------------
def deep_copy_schedule(schedule):
    """
    Recursively copies nested dicts/lists to avoid mutating original
    """
    if isinstance(schedule, dict):
        return {k: deep_copy_schedule(v) for k, v in schedule.items()}
    elif isinstance(schedule, list):
        return [deep_copy_schedule(i) for i in schedule]
    else:
        return schedule

# ----------------------------
# Get next available slot for a batch/faculty
# ----------------------------
def next_available_slot(occupied_slots, all_slots):
    """
    Returns first free slot not in occupied_slots
    """
    for slot in all_slots:
        if slot not in occupied_slots:
            return slot
    return None
