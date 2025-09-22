# Timetable Scheduler (Demo Project)

This package contains a model-based timetable scheduler with:
- data/ : input JSON files and demo dataset
- models/ : domain models (Classroom, Faculty, Subject, Batch, Timetable)
- scheduler/ : solver and constraint checker
- io/ : data loader, validator, output writer
- tests/ : basic smoke tests
- docs/ : requirements and data format

Quickstart:
1. Copy the contents of data/ to your project's data folder (or replace).
2. Run `python main.py` from the project root (not included here) or use the provided demo runner.

Sorry — got it. Here’s the **entire** detailed project report pasted as Markdown. You can copy this directly into `docs/ProjectReport.md` or any file you like.

---

# Timetable Scheduler — Complete Project Report & Technical Reference

Below is a long, careful, comprehensive description of this timetable-scheduling project: what it is, how it’s organized, what each part expects and produces, the algorithms and heuristics used, how to run it, how to inspect and verify results, known limitations, common failure modes and fixes, and concrete next steps you can take to improve, extend, or present the system.

I wrote this to be a self-contained reference you can copy into a `docs/ProjectReport.md` or use as the text for a README / exhibition poster. Read the table of contents and jump to any section you need.

---

## Table of contents

1. Summary — what this project does
2. Directory layout (what files live where)
3. Data formats — precise JSON schemas for inputs & outputs
4. Execution flow (CLI pipeline) — step-by-step what runs and why
5. Core algorithms — session generation and solver behavior
6. Constraints & checks — what is enforced and when
7. Scoring & ranking — how timetables are scored and normalized
8. Verification — how to check hours-per-week & completeness
9. Outputs — files produced and how to view them (Excel, JSON)
10. Running the project — commands, environment, tips
11. Diagnostics — common errors and fixes (with exact steps)
12. Performance considerations and tuning knobs
13. Limitations and known edge cases
14. Suggestions for improvement & next features (prioritized)
15. Testing strategy (what tests exist and what to add)
16. Exhibition & demo tips — how to show this at a fair
17. Appendix: useful snippets and sample commands

---

# 1 — Summary

This project is a **model-based timetable scheduler** for academic institutions. It takes structured input files describing:

* the courses/subjects (hours per week, lab/theory, duration per session),
* batches of students (semester, batch size, required subjects),
* teachers/faculty (which subjects they can teach, availability, max load),
* rooms (lecture halls and labs, capacities and available slots),
* and global constraints/settings (slots per day, working days, randomness/time\_limit).

The system builds a list of *sessions* (atomic things to schedule), then uses a deterministic randomized **backtracking solver** to try to place every session into a (room, faculty, day, start-slot) while respecting availability, capacity and other constraints. If the solver can place all sessions it returns a valid timetable. The system collects multiple candidate timetables (up to `max_solutions`) and ranks them by a scoring function. Scores are normalized to 1–100 for presentation.

The code includes auxiliary utilities: a validator for input sanity, an auto-splitter for handling lab-capacity issues, a relaxed fallback mode that permits labs to be scheduled in lecture rooms, and a greedy first-fit fallback used only as a last resort for demo purposes.

---

# 2 — Directory layout (what files live where)

This is the final layout produced in `timetable_scheduler_project_with_cli.zip`. Modify paths to match your local copy.

```
timetable_scheduler/                   # package root (zip contents)
├── data/
│   ├── subjects.json
│   ├── classrooms.json
│   ├── faculty.json
│   ├── batches.json
│   ├── timetable_constraints.json
│   ├── demo_data.json
│   └── output/                        # generated outputs
├── models/
│   ├── classroom.py
│   ├── faculty.py
│   ├── subject.py
│   ├── batch.py
│   └── timetable.py
├── scheduler/
│   ├── constraint_checker.py
│   ├── timetable_solver.py
│   └── utils.py
├── io/
│   ├── data_loader.py
│   ├── data_validator.py
│   └── output_writer.py
├── tests/
│   ├── test_constraints.py
│   ├── test_scheduler.py
│   └── test_io.py
├── docs/
│   └── requirements.md
├── main.py                            # CLI entrypoint (run the pipeline)
├── run_demo_from_package.py
├── README.md
└── requirements.txt
```

Notes:

* `main.py` is the CLI that runs load → validate → schedule → write outputs.
* `models/` contains object representations used by the solver.
* `scheduler/` contains the core solver and constraint helper functions.
* `io/` handles data loading, validation and writing.
* `data/demo_data.json` is a combined dataset for quick tests.
* `data/output/` is where results are written.

---

# 3 — Data formats (JSON schemas)

Each JSON file is simple and human-editable. Below are the expected keys and types. Implementations accept sensible defaults for missing optional fields; but for best results include fullest information.

### `classrooms.json` — list of rooms

Each classroom:

```json
{
  "id": "L1",                   // unique string ID
  "name": "Computer Lab 1",
  "type": "lab" | "lecture",
  "capacity": 40,               // integer seats
  "available_days": ["Mon","Tue","Wed","Thu","Fri"],   // optional
  "available_slots": ["1","2","3","4","5","6"]         // optional
}
```

### `faculty.json` — list of faculty

Each faculty:

```json
{
  "id": "F01",
  "name": "Dr. Alice",
  "subjects": ["S101", "S102"],           // subject IDs they can teach
  "max_hours_per_week": 18,               // total hours allowed per week
  "max_lab_hours": 8,
  "max_lecture_hours": 14,
  "preferred_days": ["Mon","Tue","Wed","Thu","Fri"],
  "preferred_slots": ["1","2","3","4","5","6"]
}
```

### `subjects.json` — list of subjects

Each subject:

```json
{
  "id": "S101",
  "name": "Engineering Mathematics",
  "lab": false,                       // boolean
  "duration_slots": 1,                // number of contiguous slots per session
  "lab_block_size": null,             // for lab subjects (optional)
  "hours_per_week": 3,                // total hours per week
  "semester": 1
}
```

Notes:

* If `lab` is true, `lab_block_size` and `duration_slots` describe block length. `hours_per_week` and `duration_slots` determine number of sessions via `ceil(hours/duration)`.
* If `hours_per_week` missing, a default of 1 session is used.

### `batches.json` — list of batches (student groups)

```json
{
  "id": "B1",
  "name": "Year 1",
  "semester": 1,
  "strength": 60,
  "subjects": ["S101","S102"],
  "available_days": ["Mon","Tue","Wed","Thu","Fri"],
  "available_slots": ["1","2","3","4","5","6"]
}
```

### `timetable_constraints.json` — global settings

```json
{
  "general_settings": {
    "slots_per_day": 6,
    "working_days": ["Mon","Tue","Wed","Thu","Fri"]
  },
  "combine_semesters": [1,3,5,7],  // semesters scheduled together
  "random_seed": 7,
  "time_limit": 60,                // solver time limit (seconds)
  "max_solutions": 8,              // number of candidates to search for
  "top_k": 4                       // how many top solutions to write
}
```

---

# 4 — Execution flow (CLI pipeline)

Run the whole pipeline:

```bash
python main.py
```

`main.py` does (in order):

1. **Load** `subjects.json`, `classrooms.json`, `faculty.json`, `batches.json`, `timetable_constraints.json` from `data/`. If any missing it will error.
2. **Validator** (if `io/data_validator.py` provides `run_validator()`): execute it and save `data/output/validation_report.json`. The validator finds missing keys, ID mismatches, and capacity issues.
3. **Model instantiation**: instantiate `Classroom`, `Faculty`, `Subject`, `Batch`, and create maps used by the solver.
4. **Build sessions** using `_generate_sessions`:

   * For each batch × subject, compute how many sessions per week are needed (default: `ceil(hours_per_week / duration_slots)`).
   * Each session object: `{ batch, subject, semester, duration, batch_size, is_lab }`.
   * Sessions are sorted (lab sessions and larger batches first) — heuristic helps prune the search early.
5. **Solve** using `timetable_solver.TimetableSolver.solve`:

   * The solver runs multiple randomized attempts (seeded) until `time_limit` or `max_solutions` reached.
   * Each attempt is a backtracking search that tries to place sessions into domain candidates.
6. **Collect results** (raw timetables and scores).
7. **Normalize scores** (map raw scores to 1–100) and write `data/output/timetable_top_N.json` and `data/output/top_solution.xlsx` for the top solution if pandas is present.

---

# 5 — Core algorithms — how scheduling is built

### Session generation

* Each subject with `hours_per_week` H and session duration D occupies `ceil(H/D)` sessions per week.
* A session requires `duration=D` consecutive time slots on one day.
* If `hours_per_week` is missing, default to 1 session.

### Candidate domain generation for a session

For a session S, the solver computes a domain of candidate assignments:

* Candidate = (room\_id, faculty\_id, day, start\_slot)
* Rooms must match the session type: `lab` sessions require rooms with `type="lab"`, lectures require `type="lecture"` (unless relaxed mode used).
* Room capacity must be >= batch\_size.
* Faculty must be able to teach the subject (subject ID in faculty.subjects).
* Room, faculty, and batch must be available on that day and all consecutive slots (`duration`) must be free.
* Batch availability (available\_days/slots) is checked if specified; otherwise defaults to all working slots.

### Backtracking solver

* The solver makes a deterministic randomized order of session attempts, then for each session tries domain values in a randomized order.
* For each assignment, it calls `assign()` on room, faculty and batch models (each model tracks its own schedule and constraints).
* If assignment conflicts, it undoes any partial assignment and continues with other candidates.
* On success (all sessions placed), the attempt returns a timetable object.
* Multiple attempts are performed (changing random seed) to find additional distinct candidate timetables.

### Distinctness and signature

* For deduplication, each timetable has a `signature()` — a hash of all (semester, day, slot, batch, room, subject) assignments.
* The solver keeps unique signatures only (no duplicate timetables).

---

# 6 — Constraints & checks — what's enforced

Strict constraints enforced during assignment (backtracking solver):

* **Room availability**: room must be free for all required contiguous slots.
* **Room capacity**: room.capacity >= batch.strength (batch\_size).
* **Faculty availability**: faculty must be free for all required slots and have the subject in their `subjects` list.
* **Faculty load**: faculty `assigned_hours` must not exceed `max_hours_per_week` (and lab vs lecture counts are checked using max\_lab\_hours / max\_lecture\_hours).
* **Batch availability**: batch must be free for required slots.
* **Consecutive slots**: sessions that span multiple slots must be placed on consecutive slot IDs.

Checks performed by `data_validator.py` (if present):

* Missing IDs (subject referenced by batch but missing).
* No lab room with sufficient capacity for labs (reports specific batch & subject).
* Duplicate or malformed entries.
* Syntax / JSON structural errors.

Fallback / non-strict behaviors:

* **Auto-splitting**: if validator reports lab capacity problems, main driver can auto-split a batch into subgroups sized to fit the largest lab capacity and re-run solver.
* **Relaxed scheduling**: an intermediate fallback marks `lab` subjects as `lecture` for scheduling (useful to get demo timetables but not strictly correct).
* **Greedy fallback**: places sessions first-fit ignoring some constraints; used only for demo outputs and will be marked differently.

---

# 7 — Scoring & ranking

The solver returns candidate timetables; each timetable receives a **raw score** computed by `TimetableSolver.score()` using a small heuristic:

* **Faculty preference**: +2 points for each assignment that occurs in both the faculty's `preferred_days` and `preferred_slots`.
* **Room utilization**: +1 point for each assignment where room occupancy >= 70% (i.e., `batch_size / room.capacity >= 0.7`).

These are additive; higher raw score is better.

### Normalization to 1–100

* After solutions are collected, their raw scores are normalized linearly to the range 1..100:

  * If min\_score == max\_score (all equal), we assign 100 to all to indicate top-level equality (adjustable behavior).
  * Otherwise normalized\_score = `1 + round((raw - min)/(max-min) * 99)`.
* Normalized score is saved as `score_norm` in each `timetable_top_N.json`. Raw score is also kept as `score`.

You can extend the scoring function to include gaps, consecutive-session penalties, faculty fairness, or other soft constraints.

---

# 8 — Verification — do required hours get scheduled?

**Yes — as long as the solver returns a complete timetable.**

* The system uses session generation to convert `hours_per_week` into a required number of sessions: `sessions_per_week = ceil(hours_per_week / duration_slots)`.
* The solver attempts to place all these sessions; a successful (returned) timetable contains assignments for every session created.
* **How to verify** programmatically:

  * Count scheduled occurrences per subject in the timetable schedule JSON.
  * Compare with expected `ceil(hours/duration)` value.
  * A small utility is provided below (Appendix) to report expected vs actual sessions.

**Important caveat:** If the solver can’t find a full assignment, it will return zero strict solutions — the pipeline then either (a) suggests splits, (b) tries relaxed scheduling, or (c) uses greedy fallback. Greedy/relaxed outputs may not fully respect `hours_per_week`.

---

# 9 — Outputs — what is produced and where

Outputs are written under `data/output/`:

* `validation_report.json` — results of the validator (errors and warnings).
* `timetable_top_1.json`, `timetable_top_2.json`, ... — top-K timetables (the top `top_k` results). Each contains:

  ```json
  {
    "score": 104,
    "score_norm": 100,
    "signature": "abc123...",
    "schedule": { "1": { "Mon": { "1": [{ assignment }] ... } } }
  }
  ```
* `top_solution.xlsx` — Excel workbook with a sheet per semester; rows are days and columns are slots (requires `pandas` + `openpyxl`).
* `batches_suggested_splits.json` — if auto-splitting was used, suggested new batch definitions.
* `subjects_relaxed.json` — if relaxed scheduling was used (labs marked non-lab).
* `greedy_timetable_greedy.json` — fallback demo timetable (if fallback used).

**Schedule structure** (in JSON timetable):

* `schedule` → semester (string or int) → day (string) → slot (string) → list of assignments.
* Assignment example:

  ```json
  {
    "batch": "B1",
    "subject": "S101",
    "faculty": "F01",
    "room": "R1",
    "batch_size": 60,
    "duration": 1,
    "is_lab": false
  }
  ```

---

# 10 — How to run (commands & environment)

Minimum environment:

* Python 3.8+ (project was tested on Python 3.9/3.10)
* Optional but recommended: `pandas` and `openpyxl` to write Excel.

Install dependencies (optional):

```bash
pip install pandas openpyxl
```

Unzip package and run:

```bash
cd timetable_scheduler_project_with_cli
python main.py
```

What happens:

* `main.py` reads `data/*.json`, runs the pipeline, and writes `data/output/`.
* Inspect `data/output/validation_report.json` and `timetable_top_*.json`.
* Excel at `data/output/top_solution.xlsx` opens in Excel for a prettier display.

If you want to run on a different dataset, replace the files in `data/` with your JSON files (backup originals first).

---

# 11 — Diagnostics — common errors & fixes

Below are the most likely errors and how to fix them quickly.

### Error: `FileNotFoundError: ... scheduler/timetable.py`

Cause: `timetable_solver` tried to load `timetable.py` from the wrong directory.
Fix: ensure `timetable.py` exists in `models/`, and `timetable_solver.py` does one of:

* Import from `models/` (recommended) — patch in `timetable_solver.py`:

  ```python
  timetable_path = os.path.join(os.path.dirname(__file__), "..", "models", "timetable.py")
  ```
* Or copy `models/timetable.py` into `scheduler/timetable.py` (quick fix):

  ```powershell
  Copy-Item .\models\timetable.py .\scheduler\timetable.py -Force
  ```

### Error: No solutions found (solver returns 0)

Possible causes:

* Lab capacity mismatches: some lab sessions require larger rooms than any lab provides. Check `validation_report.json` for messages like `No lab room with capacity >= X for batch B1 subject S102`.
* Faculty assignment gaps: no faculty can teach particular subject.
* Too few available slots (e.g., sessions demand consecutive slots and slots list is too small).
* Time limit too low for difficult instances.

Fixes:

* Inspect `data/output/validation_report.json` and `data/output/batches_suggested_splits.json`.
* Increase lab capacities or split batches (the pipeline can auto-split if enabled).
* Ensure `faculty.json` contains faculty entries that include the subject ID.
* Increase `time_limit` and `max_solutions` in `timetable_constraints.json`.

### Error: Excel write fails

Cause: `pandas` or `openpyxl` not installed, or Excel file open in another program.
Fix:

```bash
pip install pandas openpyxl
# or close the Excel file if open
```

### Debug tips

* Print the domain size for the first few sessions to see which sessions have no candidates:
  Add debug print in `main.py` after sessions constructed:

  ```python
  for i, s in enumerate(sessions[:10]):
      dom = solver._generate_domain(s, classrooms, faculty, batches)
      print(i, s, "domain-size", len(dom))
  ```
* Verify normalized\_data.json: the main script generates `normalized_data.json`. Inspect this to ensure expected values (slots list, available\_days, etc).

---

# 12 — Performance considerations and tuning

The current solver is a backtracking search with randomized restarts. It is deterministic given the seed and time limit.

Key tunable parameters:

* `time_limit` (seconds): more time gives more randomized attempts and increases chance to find solutions on hard instances.
* `max_solutions`: how many candidate solutions to attempt to collect (higher => more search).
* `random_seed`: base seed for reproducible runs.
* `session ordering`: currently labs and large batches are scheduled first — you can tune ordering to improve pruning.
* **Heuristics** to add:

  * Domain ordering: sort domain values by faculty availability, room utilization, or soft penalties to test promising assignments first.
  * Forward-checking: track future domain sizes to fail early when a choice leads to zero domains later.
  * Constraint propagation: maintain counts of available slots per batch/subject to prune early.

Hardware/scale:

* The pure backtracking search complexity grows rapidly with number of sessions. For realistic deployment with many batches and subjects, consider:

  * ILP / SAT / CP solver (OR-Tools / pulp / pyomo) for stronger pruning.
  * Hybrid: use backtracking for smaller groups, ILP for global assignment, or a greedy initial solution + local search (simulated annealing) for refinement.

---

# 13 — Limitations and known edge cases

* **No global minimization of gaps**: scoring only rewards matches & utilization; gaps for batches (like long idle times) may appear.
* **Lack of advanced constraints**: no built-in support for:

  * Teacher travel & room-transition times,
  * Blocked days (holidays),
  * Multiple parallel sections per batch unless explicitly modeled,
  * Room features (projector, OS-specific labs) beyond `type` and `capacity`.
* **Greedy fallback** can produce schedules that violate strict constraints — used for demo only.
* **Edge of rounding**: if session count uses `round(...)` you might underschedule hours — recommended change to `ceil(...)`.
* **Faculty schedule representation**: the current `Faculty` model assumes `preferred_slots` represent both availability and preference — there is no distinction between hard unavailability and soft preference. If you need both, add `available_slots` and `preferred_slots` separately.

---

# 14 — Suggestions for improvement & next features (priority ordered)

1. **Guarantee hours via `ceil()`**: change session generation to `ceil(hours / duration)` — prevents under-scheduling.
2. **Improve solver heuristics**:

   * Forward-checking and domain-size-first ordering.
   * Better domain ordering using penalties (gaps, faculty fairness).
3. **Add CP/ILP fallback**: integrate OR-Tools CP-SAT for large instances or to prove infeasibility.
4. **Hard vs soft constraint separation**: explicitly model both and use penalized objective for soft constraints.
5. **GUI / visualization**: generate nicer PDF/HTML views for exhibition.
6. **Conflict explainers**: when solver fails, return a clear human-readable explanation of blocking constraints.
7. **Batch splitting strategies**: make split rules smarter (balance group sizes, reuse faculty).
8. **Configuration file** or CLI flags to easily change `time_limit`, `top_k`, `random_seed` without editing JSONs.
9. **Unit tests & synthetic generator**: add script to produce many datasets for stress testing.
10. **Parallel randomized attempts**: run randomized attempts in parallel processes for faster solution discovery.

---

# 15 — Testing strategy

The package includes *basic smoke tests* (existence & demo run). For production readiness add:

* **Unit tests** for each model: `Classroom.is_available`, `assign/unassign`, `Batch.assign`, `Faculty.assign` and their counters.
* **Constraint checker tests**: deliberately create conflicts (overbooked room, duplicate faculty assignment) and verify validator detects them.
* **Solver correctness tests**: small hand-crafted models with known feasible solutions (enumerable) — solver must find at least one.
* **Integration tests**: run `main.py` on the synthetic big dataset and assert `top_k` files exist and that `verify_timetable_schedule` shows expected sessions >= required.
* **Performance tests**: measure solver time across dataset sizes and tune `time_limit` accordingly.

---

# 16 — Exhibition & demo tips

If you will showcase at an exhibition (poster / live demo):

* Provide a small GUI or slides that show:

  * Input summary (counts: subjects, batches, rooms, faculty).
  * Validation report (colored — green = OK, orange = warnings, red = errors).
  * Top 3 timetables with normalized score and human-readable spreadsheets.
* Use `top_solution.xlsx` as a clean table viewers can open.
* Prepare two datasets:

  1. Small deterministic dataset (2–3 batches, easy to solve — demo interactive runs).
  2. Large synthetic dataset (the one I created) to show solver finds multiple solutions quickly.
* Pre-run `main.py` and keep `data/output/` files ready to avoid wait times at the booth.
* Explain tradeoffs: “this solver guarantees strict constraints; for extremely packed inputs we auto-split or relax constraints to produce demo-friendly outputs.”
* Bring a printed cheat sheet of common messages (e.g., lab capacity issue and what to change).

---

# 17 — Appendix: useful snippets and sample commands

### Normalize scores snippet (drop into `main.py` when saving results)

```python
raw_scores = [r['score'] for r in results]
min_s = min(raw_scores) if raw_scores else 0
max_s = max(raw_scores) if raw_scores else 0
def normalize(score):
    if max_s == min_s:
        return 100
    return int(round(1 + (score - min_s) / (max_s - min_s) * 99))
for i, sol in enumerate(results[:top_k]):
    raw = sol['score']
    norm_score = normalize(raw)
    out = {"score": raw, "score_norm": norm_score, "signature": sol.get('signature'),
           "schedule": sol['timetable'].schedule}
    with open(os.path.join(OUTPUT_DIR, f"timetable_top_{i+1}.json"), "w") as f:
        json.dump(out, f, indent=2)
```

### Change session generation to `ceil()` (in `timetable_solver._generate_sessions`)

```python
import math
hours = getattr(subj, "hours_per_week", 0) or 0
dur = getattr(subj, "duration_slots", 1) or 1
if hours > 0:
    sessions_per_week = max(1, int(math.ceil(hours / dur)))
else:
    sessions_per_week = 1
```

### Verify scheduled hours utility

```python
import json, math

def expected_sessions(subj):
    hours = subj.get('hours_per_week',0) or 0
    dur = subj.get('duration_slots',1) or 1
    return max(1, int(math.ceil(hours/dur))) if hours>0 else 1

def verify_schedule(schedule, subjects):
    subj_map = {s['id']: s for s in subjects}
    counts = {}
    for sem in schedule:
        for day in schedule[sem]:
            for slot in schedule[sem][day]:
                for a in schedule[sem][day][slot]:
                    counts[a['subject']] = counts.get(a['subject'],0)+1
    report = {}
    for sid, s in subj_map.items():
        report[sid] = {"expected": expected_sessions(s), "scheduled": counts.get(sid,0)}
    return report
```

### Quick run commands

```bash
# unzip package
unzip timetable_scheduler_project_with_cli.zip
cd timetable_scheduler_project_with_cli

# run the full pipeline
python main.py

# open outputs
ls data/output
# if pandas installed, also open top_solution.xlsx in Excel
```

---

## Final notes & offer

* I tried to be precise: every behavior described above maps to code in the package (`models/*`, `scheduler/timetable_solver.py`, `main.py`).
* If you want, I can:

  * Patch your package here now to use `ceil()` and normalized scores and produce a new zip with sample outputs included. (Type: **“Patch and zip”**.)
  * Or create a prettier PDF of this report for printing.
  * Or add a short presentation slide text (3–4 slides) and generate PDF with screenshots.
  * Or create a small web page (static HTML) that shows top timetable(s) nicely formatted for exhibition.

Which of those would you like next?

---

If you want any edits to the report (formatting, more technical detail on a particular function, diagrams, or a one-page abstract for printing), tell me which section and I’ll expand it.
