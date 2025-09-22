import os, json
def test_demo_json_present():
    root = os.path.dirname(os.path.dirname(__file__))
    assert os.path.exists(os.path.join(root, 'data', 'demo_data.json'))
