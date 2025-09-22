
class Subject:
    def __init__(self, id, name=None, type="theory", credits=0, semester=None, hours_per_week=0, duration_slots=1, lab=False, lab_block_size=None, **kwargs):
        self.id = id
        self.name = name or id
        self.type = type if type else ("lab" if lab else "theory")
        self.credits = int(credits or 0)
        self.semester = semester
        self.hours_per_week = int(hours_per_week or 0)
        self.duration_slots = int(duration_slots or (lab_block_size or 1))
        self.lab = bool(lab or (self.type == "lab"))
        self.lab_block_size = int(lab_block_size) if lab_block_size is not None else self.duration_slots

    def is_lab(self):
        return self.lab or self.type == "lab"

    def __repr__(self):
        return f"<Subject id={self.id} type={self.type} duration_slots={self.duration_slots}>"
