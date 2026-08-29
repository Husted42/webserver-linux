{{ config(
    materialized='table',
    schema='beerlist',
    alias='stg__clean_google_data'
) }}

SELECT 
    brewery,
    name,
    type,
    alcohol,
    country,
    rating
FROM raw_beerlist_google_data