select
    brewery.country,
    round(avg(beer.rating::numeric), 2) as avg_rating,
    count(*) as beer_count
from {{ ref('mart__beers') }} as beer
inner join {{ ref('mart__brewery') }} as brewery
    on beer.brewery_key = brewery.brewery_key
group by brewery.country
