select
    country,
    count(*) as brewery_count
from {{ ref('mart__brewery') }}
group by country