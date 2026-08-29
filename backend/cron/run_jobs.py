'''
    This isn't actually cron code, but rather a script that runs the cron jobs.
'''

from apscheduler.schedulers.blocking import BlockingScheduler
import subprocess

from jobs.google_auth import get_google_credentials
from jobs.sync_google_sheets import read_sheet
from jobs.dbt_builder import run_dbt_build

scheduler = BlockingScheduler()



# First time run requires manual execution of the following function to generate the token.json file for Google API authentication.
# After that, the token.json file can be used on the server as credentials.
def full_data_pipeline():
    get_google_credentials()
    read_sheet()
    run_dbt_build()

# Run immediately when the container boots.
full_data_pipeline()

scheduler.add_job(
    full_data_pipeline,
    "cron",
    day_of_week="mon-sun",
    minute=10,
    max_instances=1,
    coalesce=True,
)

scheduler.start()