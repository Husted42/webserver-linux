import subprocess
from pathlib import Path


def run_dbt_build():
    subprocess.run(
        [
            "dbt",
            "build",
            "--project-dir",
            "/app/dbt/dbt_webserver",
            "--profiles-dir",
            "/app/dbt/dbt_webserver",
        ],
        check=True,
    )