'''
    One-off entrypoint used by the `dbt` compose service to build dbt models
    before dependent services (e.g. backend) start.
'''

from jobs.dbt_builder import run_dbt_build

if __name__ == "__main__":
    run_dbt_build()
