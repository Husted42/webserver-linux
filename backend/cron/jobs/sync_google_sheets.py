#################### ------------------------------ Imports ------------------------------ ####################
import json
import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

import psycopg

#################### ------------------------------ Variables ------------------------------ ####################
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
TOKEN_FILE = os.path.join(os.path.dirname(__file__), "../../credentials/token.json")
GOOGLE_CREDENTIALS_JSON = os.path.join(
    os.path.dirname(__file__),
    "../../credentials/google_credentials.json",
)

#################### ------------------------------ Retrieve Google Sheets Data ------------------------------ ####################
def get_google_credentials():
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_FILE, "w", encoding="utf-8") as token_file:
                token_file.write(creds.to_json())
        else:
            if not os.path.exists(GOOGLE_CREDENTIALS_JSON):
                raise FileNotFoundError(
                    f"Missing Google credentials file: {GOOGLE_CREDENTIALS_JSON}"
                )

            with open(GOOGLE_CREDENTIALS_JSON, "r", encoding="utf-8") as creds_file:
                client_config = json.load(creds_file)

            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=0)

            with open(TOKEN_FILE, "w", encoding="utf-8") as token_file:
                token_file.write(creds.to_json())

    return creds


def read_sheet():
    print("Starting Google Sheets sync...")

    creds = get_google_credentials()
    print("Google credentials loaded successfully.")

    service = build(
        "sheets",
        "v4",
        credentials=creds,
    )
    print("Google Sheets API client created.")

    spreadsheet_id = "11vltnGMEm4kEGVtt7yZPh3Vic5_fZivZTqeHtTvmUjw"
    range_name = "Data!A1:F400"

    try:
        result = (
            service.spreadsheets()
            .values()
            .get(
                spreadsheetId=spreadsheet_id,
                range=range_name,
            )
            .execute()
        )
        print("Google Sheets API request succeeded.")
    except Exception as exc:
        print(f"Google Sheets API request failed: {exc}")
        raise

    rows = result.get("values", [])
    print(f"Rows returned: {len(rows)}")
    print("Hello")

    if not rows:
        print("No rows were found in the sheet range.")
        return []

    return rows[0], rows[1:]  # Skip the header row

def test_header(header):
    # Validate the header to ensure it matches the expected format
    test_header = ["Brewery", "Name", "Type", "Alcohol", "Country", "Rating"]
    if header != test_header:
        raise ValueError(
            f"Unexpected header in Google Sheets data. Expected: {test_header}, but got: {header}"
        )

def clean_data(rows):
    cleaned_rows = []
    for row in rows:
        if len(row) < 6:
            print(f"Skipping row due to insufficient columns: {row}")
            continue

        brewery, name, type_, alcohol, country, rating = row

        try:
            alcohol = float(str(alcohol).strip().replace(",", "."))
        except ValueError:
            print(f"Invalid alcohol value '{alcohol}' in row: {row}. Setting to None.")
            alcohol = None

        try:
            rating = float(rating)
        except ValueError:
            print(f"Invalid rating value '{rating}' in row: {row}. Setting to None.")
            rating = None

        cleaned_rows.append((brewery, name, type_, alcohol, country, rating))

    return cleaned_rows

#################### ------------------------------ SQL Upload ------------------------------ ####################

def get_db_connection():
    in_docker = os.path.exists("/.dockerenv")

    host = os.getenv("DB_HOST", "postgres" if in_docker else "localhost")
    port = int(os.getenv("DB_PORT", "5432"))
    dbname = os.getenv("POSTGRES_DB", "beerdb")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "password")

    return psycopg.connect(
        host=host,
        port=port,
        dbname=dbname,
        user=user,
        password=password,
    )


def upload_to_database(rows, connection):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM beerlist.raw_beerlist_google_data;")

    for batch in [rows[i:i + 100] for i in range(0, len(rows), 100)]:
        cursor.executemany(
            "INSERT INTO beerlist.raw_beerlist_google_data (brewery, name, type, alcohol, country, rating) VALUES (%s, %s, %s, %s, %s, %s);",
            batch,
        )
        connection.commit()
    



def sync_google_sheets():
    # Load data
    header, rows = read_sheet()

    # Fix the data format
    test_header(header)
    rows = clean_data(rows)

    # Upload to database
    connection = get_db_connection()
    upload_to_database(rows, connection)

if __name__ == "__main__":
    sync_google_sheets()