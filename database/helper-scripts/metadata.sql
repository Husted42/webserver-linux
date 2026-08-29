/*
    View all current tables in postgres database
*/
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

/*
    View data types of all columns in a table
*/
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'beers';