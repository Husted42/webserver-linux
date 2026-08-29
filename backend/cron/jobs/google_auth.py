import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

'''
    This code generates the token.json file for Google API authentication. 
    We need to run it once locally to genarate the file, then we can use this file on the server as credentials.
'''

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
]

# When run locally remove app
TOKEN_FILE = "credentials/token.json"
CREDENTIALS_FILE = "credentials/google_credentials.json"


def get_google_credentials():
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(
            TOKEN_FILE,
            SCOPES,
        )

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())

            # We want to test if the token was refreshed successfully.
            # So we first read the old, then the new and compare them.
            with open(TOKEN_FILE, "r") as token:
                token_before = token.read()
            
            with open(TOKEN_FILE, "w") as token:
                token.write(creds.to_json())

            with open(TOKEN_FILE, "r") as token:
                token_after = token.read()

            if token_before != token_after:
                print("Google credentials refreshed successfully.")
            else:
                raise Exception("Failed to refresh Google credentials. The token.json file was not updated.")

        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE,
                SCOPES,
            )

            creds = flow.run_local_server(port=0)

            print("Saving Google credentials to token.json...")
            with open(TOKEN_FILE, "w") as token:
                token.write(creds.to_json())

    return creds

if __name__ == "__main__":
    get_google_credentials()