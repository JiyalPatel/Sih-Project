import os, json, math, datetime

class DataLoader:
    """
    Loads JSON files from a given data_path (folder) and normalizes them.
    Hybrid batch-splitting: supports explicit sub_groups, lab_split_size, and auto-splitting via constraints.
    """
    def __init__(self, data_path='Data'):
        self.data_path = data_path
        self.batches = []
        self.subjects = []
        self.faculty = []
        self.classrooms = []
        self.constraints = {}

    def _read_json(self, fname):
        p = os.path.join(self.data_path, fname)
        if not os.path.exists(p):
            return None
        try:
            with open(p, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return None

    def load_all(self):
        # load files
        self.batches = self._read_json('batches.json') or []
        self.subjects = self._read_json('subjects.json') or []
        self.faculty = self._read_json('faculty.json') or []
        self.classrooms = self._read_json('classrooms.json') or []
        self.constraints = self._read_json('timetable_constraints.json') or {}

        # normalize trivial cases (strings -> dicts)
        self._normalize_basic()

        # apply hybrid batch splitting
        self._expand_batches_with_subgroups()

        # return for backwards compatibility
        return self.batches, self.subjects, self.faculty, self.classrooms, self.constraints

    def _normalize_basic(self):
        # ensure each faculty/subject/classroom is dict etc; keep minimal
        n_subjs = []
        for s in self.subjects:
            if isinstance(s, str):
                n_subjs.append({'id': s})
            else:
                n_subjs.append(s)
        self.subjects = n_subjs

        n_fac = []
        for f in self.faculty:
            if isinstance(f, str):
                n_fac.append({'id': f, 'name': f})
            else:
                # ensure id exists
                if isinstance(f, dict) and 'id' not in f and 'name' in f:
                    f['id'] = f['name']
                n_fac.append(f)
        self.faculty = n_fac

    def _expand_batches_with_subgroups(self):
        """Expand batches according to rules described in class docstring."""
        new_batches = []
        subj_lab_map = {s.get('id'): bool(s.get('lab')) for s in self.subjects if isinstance(s, dict)}

        auto_split = bool(self.constraints.get('auto_split_lab_batches', False))
        auto_threshold = int(self.constraints.get('auto_split_threshold', 40))
        auto_size = int(self.constraints.get('auto_lab_split_size', 20))

        for batch in list(self.batches):
            if not isinstance(batch, dict):
                new_batches.append(batch); continue
            batch_id = batch.get('id') or batch.get('batch_id')
            if not batch_id:
                new_batches.append(batch); continue

            # 1) explicit sub_groups
            sub_groups = batch.get('sub_groups')
            if isinstance(sub_groups, list) and len(sub_groups) > 0:
                for g in sub_groups:
                    gid = g.get('id') or f"{batch_id}_G{len(new_batches)+1}"
                    try:
                        strength = int(g.get('strength') or g.get('size') or 0)
                    except Exception:
                        strength = 0
                    nb = {
                        'id': gid,
                        'semester': batch.get('semester'),
                        'strength': strength,
                        'subjects': batch.get('subjects', [])
                    }
                    new_batches.append(nb)
                continue

            # 2) shorthand lab_split_size on the batch
            lab_split_size = batch.get('lab_split_size')
            if lab_split_size:
                try:
                    lab_split_size = int(lab_split_size)
                except Exception:
                    lab_split_size = None
            if lab_split_size:
                try:
                    strength = int(batch.get('strength') or batch.get('size') or 0)
                except Exception:
                    strength = 0
                if strength <= 0:
                    new_batches.append(batch); continue
                num = math.ceil(strength / lab_split_size)
                remaining = strength
                for i in range(num):
                    this_size = lab_split_size if remaining >= lab_split_size else remaining
                    remaining -= this_size
                    gid = f"{batch_id}_G{i+1}"
                    nb = {'id': gid, 'semester': batch.get('semester'), 'strength': this_size, 'subjects': batch.get('subjects', [])}
                    new_batches.append(nb)
                continue

            # 3) auto-split if enabled and batch is large and contains lab subjects
            if auto_split:
                try:
                    strength = int(batch.get('strength') or batch.get('size') or 0)
                except Exception:
                    strength = 0
                if strength >= auto_threshold:
                    subjects = batch.get('subjects') or []
                    has_lab = False
                    for sid in subjects:
                        if subj_lab_map.get(sid):
                            has_lab = True; break
                    if has_lab:
                        num = math.ceil(strength / auto_size) if auto_size > 0 else 1
                        remaining = strength
                        for i in range(num):
                            this_size = auto_size if remaining >= auto_size else remaining
                            remaining -= this_size
                            gid = f"{batch_id}_G{i+1}"
                            nb = {'id': gid, 'semester': batch.get('semester'), 'strength': this_size, 'subjects': subjects}
                            new_batches.append(nb)
                        continue

            # otherwise keep original batch
            new_batches.append(batch)

        self.batches = new_batches

    def validate_data(self, strict=False):
        """
        Validate loaded data. Returns (batches, subjects, faculty, classrooms, constraints).
        strict: if True, raise on warnings as well; if False, auto-fix safe issues and warn.
        """
        batches, subjects, faculty, classrooms, constraints = self.load_all()
        warnings = []
        errors = []

        def to_map(lst, name):
            m = {}
            for i, obj in enumerate(list(lst)):
                if not isinstance(obj, dict):
                    warnings.append(f"{name}[{i}] is not an object; ignored.")
                    try:
                        lst.remove(obj)
                    except Exception:
                        pass
                    continue
                oid = obj.get('id') or obj.get('name')
                if not oid:
                    oid = f"{name}_{i+1}"
                    obj['id'] = oid
                    warnings.append(f"{name}[{i}] missing id; set id = {oid}")
                if oid in m:
                    j = 2
                    new_oid = f"{oid}_{j}"
                    while new_oid in m:
                        j += 1
                        new_oid = f"{oid}_{j}"
                    obj['id'] = new_oid
                    warnings.append(f"Duplicate {name} id '{oid}' -> renamed to '{new_oid}'")
                    oid = new_oid
                m[oid] = obj
            return m

        subj_map = to_map(subjects, 'subject')
        fac_map = to_map(faculty, 'faculty')
        room_map = to_map(classrooms, 'room')

        # Ensure constraints keys
        gs = constraints.get('general_settings', {})
        if 'slots_per_day' not in gs:
            gs['slots_per_day'] = 6
            warnings.append("general_settings.slots_per_day missing -> default 6")
        if 'working_days' not in gs:
            gs['working_days'] = ["Mon","Tue","Wed","Thu","Fri"]
            warnings.append("general_settings.working_days missing -> default Mon..Fri")
        constraints['general_settings'] = gs

        # Check batches refer to existing subjects
        for b in list(batches):
            if not isinstance(b, dict):
                warnings.append("Found non-dict batch entry; ignoring.")
                try:
                    batches.remove(b)
                except Exception:
                    pass
                continue
            bl = b.get('subjects') or []
            new_list = []
            for sid in bl:
                if sid not in subj_map:
                    warnings.append(f"Batch {b.get('id')} references unknown subject '{sid}' -> removed from batch.")
                    continue
                new_list.append(sid)
            b['subjects'] = new_list
            if len(new_list) == 0:
                errors.append(f"Batch {b.get('id')} has no valid subjects after validation.")

        # normalize numeric fields
        def norm_int_field(obj, field, default=None):
            v = obj.get(field)
            if v is None:
                if default is not None:
                    obj[field] = default
                    warnings.append(f"{obj.get('id')} missing '{field}' -> default {default}")
                return
            try:
                obj[field] = int(v)
                if obj[field] < 0:
                    warnings.append(f"{obj.get('id')}.{field} negative -> taking abs")
                    obj[field] = abs(obj[field])
            except Exception:
                if default is not None:
                    obj[field] = default
                    warnings.append(f"{obj.get('id')}.{field} invalid -> default {default}")
                else:
                    errors.append(f"{obj.get('id')}.{field} invalid and no default.")

        for b in batches:
            norm_int_field(b, 'strength', default=30)

        for s in subjects:
            norm_int_field(s, 'hours_per_week', default=3)
            if s.get('lab'):
                norm_int_field(s, 'lab_block_size', default=2)

        for r in classrooms:
            norm_int_field(r, 'capacity', default=30)
            if 'type' not in r:
                rid = r.get('id','').upper()
                r['type'] = 'lab' if rid.startswith('L') else 'lecture'
                warnings.append(f"Room {r.get('id')} missing type -> guessed '{r['type']}'")

        lab_subjects = [s['id'] for s in subjects if s.get('lab')]
        if lab_subjects and not any(r.get('type') == 'lab' for r in classrooms):
            errors.append("No lab rooms found but lab subjects exist: " + ", ".join(lab_subjects[:10]))

        for f in faculty:
            sids = f.get('subjects') or []
            new = []
            for sid in sids:
                if sid not in subj_map:
                    warnings.append(f"Faculty {f.get('id')} references unknown subject '{sid}' -> removed")
                    continue
                new.append(sid)
            f['subjects'] = new

        # faculty workload soft check
        subj_req = {s['id']: int(s.get('hours_per_week',3)) for s in subjects if isinstance(s, dict) and 'id' in s}
        for fid, f in fac_map.items():
            total = 0
            for sid in f.get('subjects', []):
                total += subj_req.get(sid, 0)
            maxh = f.get('max_hours_per_week')
            if maxh is not None:
                try:
                    maxh = int(maxh)
                    if total > maxh:
                        warnings.append(f"Faculty {fid} assigned subject-hours {total} > max_hours_per_week {maxh}")
                except Exception:
                    warnings.append(f"Faculty {fid} max_hours_per_week invalid -> ignored")

        # write report
        report = {'generated_on': datetime.datetime.now().isoformat(), 'errors': errors, 'warnings': warnings}
        try:
            rpt_path = os.path.join(self.data_path, f"validation_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            with open(rpt_path, 'w', encoding='utf-8') as fp:
                json.dump(report, fp, indent=2)
        except Exception:
            pass

        if errors:
            raise ValueError('Validation failed. Errors: ' + '; '.join(errors))

        if strict and warnings:
            raise ValueError('Validation warnings treated as errors (strict). Warnings: ' + '; '.join(warnings))

        return batches, subjects, faculty, classrooms, constraints
