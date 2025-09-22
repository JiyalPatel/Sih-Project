
"""
CLI entrypoint for timetable_scheduler package.

Runs end-to-end pipeline:
- Loads data from ./data/
- Runs validator if present: io/data_validator.py -> run_validator()
- Instantiates model objects from models/
- Runs scheduler/timetable_solver.TimetableSolver
- Writes top_k solutions to ./data/output/ as JSON (and Excel if pandas available)
"""

import os, json, importlib.util, time, traceback

BASE = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE, "data")
OUTPUT_DIR = os.path.join(DATA_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_json(name):
    p = os.path.join(DATA_DIR, name)
    if not os.path.exists(p):
        raise FileNotFoundError(p)
    return json.load(open(p))

# 1) load canonical data (expects the five JSON files)
files = ["subjects.json","classrooms.json","faculty.json","batches.json","timetable_constraints.json"]
data = {}
for f in files:
    try:
        data[f] = load_json(f)
    except Exception as e:
        print("ERROR loading", f, ":", e)
        raise

# attempt to run the validator if present
validator_path = os.path.join(BASE, "io", "data_validator.py")
validation_report = None
if os.path.exists(validator_path):
    try:
        spec = importlib.util.spec_from_file_location("data_validator_pkg", validator_path)
        dv = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(dv)
        if hasattr(dv, "run_validator"):
            print("Running data validator...")
            validation_report = dv.run_validator()
            with open(os.path.join(OUTPUT_DIR, "validation_report.json"), "w") as vf:
                json.dump(validation_report, vf, indent=2)
            print("Validation completed. errors:", len(validation_report.get("errors",[])), "warnings:", len(validation_report.get("warnings",[])))
    except Exception as e:
        print("Validator failed:", e)
        traceback.print_exc()

# 2) import model classes from models/
def import_model(name):
    path = os.path.join(BASE, "models", name + ".py")
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

models = {}
for m in ["classroom","faculty","subject","batch","timetable"]:
    try:
        models[m] = import_model(m)
    except Exception as e:
        print("Failed to import model", m, ":", e)
        raise

# instantiate maps
classrooms = {r['id']: models['classroom'].Classroom(**r) for r in data["classrooms.json"]}
faculty = {f['id']: models['faculty'].Faculty(**f) for f in data["faculty.json"]}
subjects = {s['id']: models['subject'].Subject(**s) for s in data["subjects.json"]}
batches = {b['id']: models['batch'].Batch(**b) for b in data["batches.json"]}

# 3) import solver
solver_path = os.path.join(BASE, "scheduler", "timetable_solver.py")
spec = importlib.util.spec_from_file_location("timetable_solver_pkg", solver_path)
solver_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(solver_mod)

# build sessions (the solver exposes _generate_sessions in our packaged solver)
slots = data["timetable_constraints.json"].get("general_settings", {}).get("slots_per_day", 6)
slots = [str(i) for i in range(1, slots+1)]
working_days = data["timetable_constraints.json"].get("general_settings", {}).get("working_days", ["Mon","Tue","Wed","Thu","Fri"])
time_limit = data["timetable_constraints.json"].get("time_limit", 60)
max_solutions = data["timetable_constraints.json"].get("max_solutions", 4)
top_k = data["timetable_constraints.json"].get("top_k", min(4, max_solutions))

solver = solver_mod.TimetableSolver(slots=slots, working_days=working_days,
                                   classrooms_map=classrooms, faculty_map=faculty, batches_map=batches, subjects_map=subjects,
                                   random_seed=data["timetable_constraints.json"].get("random_seed", 42),
                                   time_limit=time_limit)

print("Generating sessions...")
sessions = solver._generate_sessions(batches)
print("Total sessions to schedule:", len(sessions))

print("Running solver (time_limit={}s, max_solutions={})...".format(time_limit, max_solutions))
start = time.time()
results = solver.solve(sessions, max_solutions=max_solutions)
elapsed = time.time() - start
print("Solver finished in {:.1f}s, found {} solutions".format(elapsed, len(results)))

# # Save top_k results
# for i, sol in enumerate(results[:top_k]):
#     out = {"score": sol['score'], "signature": sol.get('signature'), "schedule": sol['timetable'].schedule}
#     fname = os.path.join(OUTPUT_DIR, f"timetable_top_{i+1}.json")
#     with open(fname, "w") as f:
#         json.dump(out, f, indent=2)
#     print("Wrote", fname, "score", sol['score'])

# --- Normalize scores into 1..100 and save ---
raw_scores = [r['score'] for r in results]
if raw_scores:
    min_s = min(raw_scores)
    max_s = max(raw_scores)
else:
    min_s = max_s = 0

def normalize(score, lo=min_s, hi=max_s):
    # Map lo..hi -> 1..100 ; if all equal give 100
    if hi == lo:
        return 100
    # linear mapping
    return int(round(1 + (score - lo) / (hi - lo) * 99))

for i, sol in enumerate(results[:top_k]):
    raw = sol['score']
    norm_score = normalize(raw)
    out = {
        "score": raw,
        "score_norm": norm_score,
        "signature": sol.get('signature'),
        "schedule": sol['timetable'].schedule
    }
    fname = os.path.join(OUTPUT_DIR, f"timetable_top_{i+1}.json")
    with open(fname, "w") as f:
        json.dump(out, f, indent=2)
    print("Wrote", fname, "score (raw,norm)=({}, {})".format(raw, norm_score))


# try to write excel for top solution if pandas is available
try:
    import pandas as pd
    if results:
        top = results[0]['timetable']
        xlsx_path = os.path.join(OUTPUT_DIR, "top_solution.xlsx")
        with pd.ExcelWriter(xlsx_path) as writer:
            for sem in top.schedule:
                rows = []
                for day in top.schedule[sem]:
                    row = {"Day": day}
                    for slot in sorted(top.schedule[sem][day].keys(), key=lambda x:int(x) if str(x).isdigit() else x):
                        assigns = top.schedule[sem][day][slot]
                        row[f"Slot_{slot}"] = ";".join([f"{a.get('batch')}@{a.get('room')}:{a.get('subject')}" for a in assigns]) if assigns else ""
                    rows.append(row)
                df = pd.DataFrame(rows)
                df.to_excel(writer, sheet_name=f"Sem_{sem}", index=False)
        print("Wrote Excel at", xlsx_path)
except Exception as e:
    print("Pandas/Excel write skipped or failed:", e)

print("Pipeline complete. Outputs in", OUTPUT_DIR)
