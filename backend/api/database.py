import os

import psycopg
from psycopg.rows import dict_row


def get_connection():
    in_docker = os.path.exists("/.dockerenv")

    return psycopg.connect(
        host=os.getenv("DB_HOST", "postgres" if in_docker else "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("POSTGRES_DB", "beerdb"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "password"),
        row_factory=dict_row,
    )
