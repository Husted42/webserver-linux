{{
    config(
        materialized='incremental',
        unique_key='brewery_key',
        incremental_strategy='append'
    )
}}

with source_data as (

    select DISTINCT
        brewery,
        country,

        -- Stable identifier derived from the business columns
        {{ dbt_utils.generate_surrogate_key([
            "lower(trim(brewery))",
            "lower(trim(country))"
        ]) }}::uuid as brewery_key

    from {{ ref('stg__clean_google_data') }}

),

new_records as (

    select
        source_data.*

    from source_data

    {% if is_incremental() %}

        where not exists (
            select 1
            from {{ this }} as target
            where target.brewery_key = source_data.brewery_key
        )

    {% endif %}

)

select
    brewery_key as id,
    brewery_key,

    brewery,
    country,

    current_timestamp as inserted_at,
    current_user as inserted_by

from new_records