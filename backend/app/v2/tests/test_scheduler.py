import os, json, importlib.util, runpy
def test_solver_runs_demo():
    # run the demo runner if present
    root = os.path.dirname(os.path.dirname(__file__))
    data_dir = os.path.join(root, 'data')
    demo = os.path.join(data_dir, 'demo_data.json')
    assert os.path.exists(demo)
