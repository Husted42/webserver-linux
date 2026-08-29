import json
import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
TOKEN_FILE = os.path.join(os.path.dirname(__file__), "../../credentials/token.json")
GOOGLE_CREDENTIALS_JSON = os.path.join(
    os.path.dirname(__file__),
    "../../credentials/google_credentials.json",
)


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
    range_name = "Data!A1:D100"

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

    if not rows:
        print("No rows were found in the sheet range.")
        return []

    for row in rows:
        print(row)

    return rows

if __name__ == "__main__":
    read_sheet()