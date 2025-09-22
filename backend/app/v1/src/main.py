# timetable_scheduler/main.py

import argparse
import json
import os
from datetime import datetime

from data_io.data_loader import DataLoader
from data_io.output_writer import OutputWriter
from scheduler.timetable_solver import TimetableSolver

def parse_arguments():
    parser = argparse.ArgumentParser(description="Automated Timetable Scheduler")
    parser.add_argument("--input_dir", type=str, default="data",
                        help="Path to input JSON files (batches, subjects, faculty, classrooms, constraints)")
    parser.add_argument("--output_dir", type=str, default="data/output",
                        help="Path to save generated timetables")
    parser.add_argument("--max_solutions", type=int, default=3,
                        help="Maximum number of ranked timetable solutions to generate")
    parser.add_argument("--verbose", action="store_true",
                        help="Enable detailed logging of timetable generation")
    parser.add_argument("--excel", action="store_true",
                        help="Export timetables to Excel (requires pandas)")
    return parser.parse_args()


def main():
    args = parse_arguments()

    print("==== Timetable Scheduler ====")
    print(f"Loading data from: {args.input_dir}")
    
    # ----------------------------
    # Load & validate data
    # ----------------------------
    loader = DataLoader(data_path=args.input_dir)
    loader.load_all()
    loader.validate_data()
    
    print("Data loaded and validated successfully.")

    # ----------------------------
    # Initialize solver
    # ----------------------------
    solver = TimetableSolver(
        batches=loader.batches,
        subjects=loader.subjects,
        faculty=loader.faculty,
        classrooms=loader.classrooms,
        constraints=loader.constraints
    )
    print("Solver initialized. Generating timetables...")

    # ----------------------------
    # Solve timetables
    # ----------------------------
    solutions = solver.solve(max_solutions=args.max_solutions)
    print(f"{len(solutions)} timetable solution(s) generated.")

    # ----------------------------
    # Prepare output
    # ----------------------------
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"timetables_{timestamp}.json"
    
    writer = OutputWriter(output_path=args.output_dir)
    
    output_timetables = []
    for rank, sol in enumerate(solutions, start=1):
        output_timetables.append({
            "timetable_id": f"T{rank}",
            "rank": rank,
            "score": sol['score'],
            "schedule": [
                {
                    "batch_id": b,
                    "subject_id": s,
                    "faculty_id": solver.get_faculty_for_subject(s),
                    "room_id": sess['room_id'],
                    "day": sess['day'],
                    "slots": sess['slot']
                }
                for b, s, sess in sol['assignment']
            ]
        })

    writer.save_timetables(output_timetables, filename=output_filename)

    print(f"Timetables saved successfully to {os.path.join(args.output_dir, output_filename)}")

    # ----------------------------
    # Optional Excel export
    # ----------------------------
    if args.excel:
        try:
            import pandas as pd
            excel_filename = os.path.join(args.output_dir, f"timetables_{timestamp}.xlsx")
            all_rows = []
            for t in output_timetables:
                for sess in t['schedule']:
                    all_rows.append({
                        "Timetable": t['timetable_id'],
                        "Rank": t['rank'],
                        "Batch": sess['batch_id'],
                        "Subject": sess['subject_id'],
                        "Faculty": sess['faculty_id'],
                        "Room": sess['room_id'],
                        "Day": sess['day'],
                        "Slots": ','.join(map(str, sess['slots']))
                    })
            df = pd.DataFrame(all_rows)
            df.to_excel(excel_filename, index=False)
            print(f"Excel timetables saved to {excel_filename}")
        except ImportError:
            print("Pandas not installed. Skipping Excel export.")


if __name__ == "__main__":
    main()
