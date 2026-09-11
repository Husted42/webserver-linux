{{
	config(
		materialized='incremental',
		unique_key='beer_key',
		incremental_strategy='append'
	)
}}

with source_data as (

	select distinct
		brewery.brewery_key,
		staging.name,
		staging.type,
		staging.alcohol,
		staging.rating,

		{{ dbt_utils.generate_surrogate_key([
			"brewery.brewery_key",
			"lower(trim(staging.name))",
			"lower(trim(staging.type))"
		]) }}::uuid as beer_key

	from {{ ref('stg__clean_google_data') }} as staging
	inner join {{ ref('mart__brewery') }} as brewery
		on lower(trim(staging.brewery)) = lower(trim(brewery.brewery))
		and lower(trim(staging.country)) = lower(trim(brewery.country))

),

new_records as (

	select
		source_data.*

	from source_data

	{% if is_incremental() %}

		where not exists (
			select 1
			from {{ this }} as target
			where target.beer_key = source_data.beer_key
		)

	{% endif %}

)

select
	beer_key as id,
	beer_key,
	brewery_key,
	name,
	type,
	alcohol,
	rating,
	current_timestamp as inserted_at,
	current_user as inserted_by

from new_records
