{{ config(
    materialized='view',
    alias='stg__clean_google_data'
) }}

SELECT 
    brewery,
    name,
    type,
    alcohol::numeric AS alcohol,
    {{ normalize_country('country') }} AS country,
    rating::numeric AS rating
FROM {{ source('beerlist', 'raw_beerlist_google_data') }}