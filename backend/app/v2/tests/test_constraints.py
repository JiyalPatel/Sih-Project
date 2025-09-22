import os, json, importlib.util
# Basic smoke test for constraint checker
def import_mod_from_root(name, root='/mnt/data'):
    path = os.path.join(root, name + '.py')
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def test_constraint_checker_runs():
    # use the scheduler/constraint_checker from the packaged project
    root = os.path.dirname(os.path.dirname(__file__))
    cc = import_mod_from_root('constraint_checker', root=os.path.join(root, '..', 'scheduler'))
    # simple sanity: class exists or functions present
    assert hasattr(cc, 'ModelConstraintChecker') or hasattr(cc, 'check_no_room_clashes')
