/*
    This script is run when we do docker compose up for the first time. 
    It creates the database tables if they don't exist.
*/
CREATE TABLE IF NOT EXISTS brewers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT
);

CREATE TABLE IF NOT EXISTS beers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brewer_id INTEGER REFERENCES brewers(id),
    abv NUMERIC(4,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);