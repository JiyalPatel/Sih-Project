# Demo runner: uses /mnt/data/main.py (project entrypoint) if present.
import os, runpy, sys
mainp = os.path.join('/mnt/data','main.py')
if os.path.exists(mainp):
    print('Running /mnt/data/main.py ...')
    runpy.run_path(mainp, run_name='__main__')
else:
    print('No /mnt/data/main.py found. Copy this package into your project root and run your main entry.')
