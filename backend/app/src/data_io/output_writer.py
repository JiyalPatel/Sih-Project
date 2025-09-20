import json
import os

class OutputWriter:
    def __init__(self, output_path="data/output"):
        self.output_path = output_path
        os.makedirs(self.output_path, exist_ok=True)

    # ----------------------------
    # Save multiple timetables to JSON
    # ----------------------------
    def save_timetables(self, timetables, filename="generated_timetables.json"):
        """
        timetables: list of dicts
            Each dict represents one timetable with structure:
            {
                "timetable_id": "T1",
                "rank": 1,
                "schedule": {
                    "B3A": { "Mon": {"1": "IT101"}, ... },
                    ...
                },
                "score": 87.5  # optional metric
            }
        """
        file_path = os.path.join(self.output_path, filename)
        try:
            with open(file_path, 'w') as f:
                json.dump({"timetables": timetables}, f, indent=4)
            print(f"Timetables successfully saved to {file_path}")
        except Exception as e:
            raise Exception(f"Error saving timetables: {str(e)}")
