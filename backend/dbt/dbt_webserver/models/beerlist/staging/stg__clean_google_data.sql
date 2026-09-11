{{ config(
    materialized='table',
    alias='stg__clean_google_data'
) }}

SELECT 
    brewery,
    name,
    type,
    alcohol,
    {{ normalize_country('country') }} AS country,
    rating
FROM {{ source('beerlist', 'raw_beerlist_google_data') }}