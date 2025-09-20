import json
import os

class DataLoader:
    def __init__(self, data_path="data"):
        self.data_path = data_path
        self.batches = []
        self.subjects = []
        self.faculty = []
        self.classrooms = []
        self.constraints = {}

    # ----------------------------
    # Load JSON file safely
    # ----------------------------
    def load_json(self, filename):
        file_path = os.path.join(self.data_path, filename)
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            return data
        except FileNotFoundError:
            raise Exception(f"{filename} not found in {self.data_path}")
        except json.JSONDecodeError as e:
            raise Exception(f"Error parsing {filename}: {str(e)}")

    # ----------------------------
    # Load all data
    # ----------------------------
    def load_all(self):
        self.batches = self.load_json("batches.json")['batches']
        self.subjects = self.load_json("subjects.json")['subjects']
        self.faculty = self.load_json("faculty.json")['faculty']
        self.classrooms = self.load_json("classrooms.json")['classrooms']
        self.constraints = self.load_json("timetable_constraints.json")

    # ----------------------------
    # Basic sanity checks
    # ----------------------------
    def validate_data(self):
        # Ensure all batch subjects exist
        subject_ids = {s['id'] for s in self.subjects}
        for batch in self.batches:
            for subj in batch['subjects']:
                if subj not in subject_ids:
                    raise Exception(f"Batch {batch['id']} references unknown subject {subj}")

        # Ensure faculty subjects exist
        for fac in self.faculty:
            for subj in fac.get('subjects', []):
                if subj not in subject_ids:
                    raise Exception(f"Faculty {fac['id']} references unknown subject {subj}")

        # Ensure classrooms have required keys
        required_room_keys = {'id', 'name', 'type', 'capacity', 'available_days', 'available_slots'}
        for room in self.classrooms:
            missing = required_room_keys - room.keys()
            if missing:
                raise Exception(f"Classroom {room.get('id')} missing keys: {missing}")

        print("Data validation passed successfully.")
