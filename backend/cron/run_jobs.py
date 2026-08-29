from apscheduler.schedulers.blocking import BlockingScheduler

from jobs.sync_google_sheets import sync_google_sheets

scheduler = BlockingScheduler()

scheduler.add_job(
    sync_google_sheets,
    "cron",
    day_of_week=["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    minute=3,
)

'''
scheduler.add_job(
    sync_google_sheets,
    "cron",
    day_of_week="sun",
    hour=3,
)
'''

scheduler.start()