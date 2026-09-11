/*
    This script is run when we do docker compose up for the first time. 
    It creates the database tables if they don't exist.
*/
CREATE SCHEMA IF NOT EXISTS beerlist;

CREATE TABLE IF NOT EXISTS beerlist.raw_beerlist_google_data (
    brewery TEXT,
    name TEXT,
    type TEXT,
    alcohol TEXT,
    country TEXT,
    rating TEXT
);