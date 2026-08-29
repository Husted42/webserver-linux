from apscheduler.schedulers.blocking import BlockingScheduler

from jobs.google_auth import get_google_credentials
from jobs.sync_google_sheets import read_sheet

scheduler = BlockingScheduler()


# First time run requires manual execution of the following function to generate the token.json file for Google API authentication.
# After that, the token.json file can be used on the server as credentials.
scheduler.add_job(
    get_google_credentials,
    "cron",
    day_of_week="mon-sun",
    minute=10,
)

scheduler.add_job(
    read_sheet,
    "cron",
    day_of_week="mon-sun",
    minute=15,
)

scheduler.start()