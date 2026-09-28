from fastapi import APIRouter, Query

from .database import get_connection

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

'''
    This is used for the barchar chart showing the average rating by country.
    RatingByCountryChart.tsx
'''
@router.get("/avg-rating-by-country")
def avg_rating_by_country(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        select
            brewery.country,
            round(avg(beer.rating::numeric), 2) as avg_rating,
            count(*) as beer_count
        from beerlist.mart__beers as beer
        inner join beerlist.mart__brewery as brewery
            on beer.brewery_key = brewery.brewery_key
        where (%(country)s::text is null or brewery.country = %(country)s::text)
            and (%(brewery)s::text is null or brewery.brewery = %(brewery)s::text)
            and (%(type)s::text is null or beer.type = %(type)s::text)
        group by brewery.country
        order by avg_rating desc;
    """
    params = {"country": country, "brewery": brewery, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()


'''
    This is used for the beer style donut chart.
    BeerStyleDonutChart.tsx
'''
@router.get("/beer-style-distribution")
def beer_style_distribution(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        select
            beer.type,
            count(*) as beer_count,
            round(avg(beer.rating::numeric), 2) as avg_rating
        from beerlist.mart__beers as beer
        inner join beerlist.mart__brewery as brewery
            on beer.brewery_key = brewery.brewery_key
        where (%(country)s::text is null or brewery.country = %(country)s::text)
            and (%(brewery)s::text is null or brewery.brewery = %(brewery)s::text)
            and (%(type)s::text is null or beer.type = %(type)s::text)
        group by beer.type
        order by beer_count desc;
    """
    params = {"country": country, "brewery": brewery, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()


'''
    This is used for the top breweries leaderboard/podium.
    TopBreweriesLeaderboard.tsx
'''
@router.get("/top-breweries")
def top_breweries(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
):
    query = """
        select
            brewery.brewery,
            brewery.country,
            round(avg(beer.rating::numeric), 2) as avg_rating,
            count(*) as beer_count
        from beerlist.mart__beers as beer
        inner join beerlist.mart__brewery as brewery
            on beer.brewery_key = brewery.brewery_key
        where (%(country)s::text is null or brewery.country = %(country)s::text)
            and (%(brewery)s::text is null or brewery.brewery = %(brewery)s::text)
            and (%(type)s::text is null or beer.type = %(type)s::text)
        group by brewery.brewery, brewery.country
        order by avg_rating desc, beer_count desc
        limit %(limit)s;
    """
    params = {"country": country, "brewery": brewery, "type": type, "limit": limit}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()


'''
    This is used for average beer ratings by alcohol percentage bucket.
    AlcoholRatingChart.tsx
'''
@router.get("/rating-by-alcohol")
def rating_by_alcohol(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        with filtered_beers as (
            select
                beer.alcohol::numeric as alcohol_percent,
                beer.rating::numeric as rating
            from beerlist.mart__beers as beer
            inner join beerlist.mart__brewery as brewery
                on beer.brewery_key = brewery.brewery_key
            where (%(country)s::text is null or brewery.country = %(country)s::text)
                and (%(brewery)s::text is null or brewery.brewery = %(brewery)s::text)
                and (%(type)s::text is null or beer.type = %(type)s::text)
        )
        select
            case
                when alcohol_percent < 4 then '< 4%'
                when alcohol_percent < 5 then '4-5%'
                when alcohol_percent < 6 then '5-6%'
                when alcohol_percent < 7 then '6-7%'
                else '7%+'
            end as alcohol_bucket,
            case
                when alcohol_percent < 4 then 1
                when alcohol_percent < 5 then 2
                when alcohol_percent < 6 then 3
                when alcohol_percent < 7 then 4
                else 5
            end as bucket_order,
            round(avg(rating), 2) as avg_rating,
            count(*) as beer_count
        from filtered_beers
        where alcohol_percent is not null and rating is not null
        group by alcohol_bucket, bucket_order
        order by bucket_order;
    """
    params = {"country": country, "brewery": brewery, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()


'''
    We have 3 different values displayed on home page: #beers, #breweries, and #countries.
    page.stx
'''
# This is the function to get the number of different beers displayed on the home page.
@router.get("/beer-count")
def no_of_different_beers(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        select
            count(distinct beer.beer_key) as beer_count
        from beerlist.mart__beers as beer
        inner join beerlist.mart__brewery as brewery
            on beer.brewery_key = brewery.brewery_key
        where (%(country)s::text is null or brewery.country = %(country)s::text)
            and (%(brewery)s::text is null or brewery.brewery = %(brewery)s::text)
            and (%(type)s::text is null or beer.type = %(type)s::text);
    """
    params = {"country": country, "brewery": brewery, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()

# This is the function to get the number of different breweries displayed on the home page.
@router.get("/brewery-count")
def no_of_different_breweries(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        select
            count(distinct brewery.brewery_key) as brewery_count
        from beerlist.mart__brewery as brewery
        inner join beerlist.mart__beers as beer
            on beer.brewery_key = brewery.brewery_key
        where (%(country)s::text is null or brewery.country = %(country)s::text)
            and (%(brewery)s::text is null or brewery.brewery = %(brewery)s::text)
            and (%(type)s::text is null or beer.type = %(type)s::text);
    """
    params = {"country": country, "brewery": brewery, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()

# This is the function to get the number of different countries displayed on the home page.
@router.get("/country-count")
def no_of_different_countries(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        select
            count(distinct brewery.country) as country_count
        from beerlist.mart__brewery as brewery
        inner join beerlist.mart__beers as beer
            on beer.brewery_key = brewery.brewery_key
        where (%(country)s::text is null or brewery.country = %(country)s::text)
            and (%(brewery)s::text is null or brewery.brewery = %(brewery)s::text)
            and (%(type)s::text is null or beer.type = %(type)s::text);
    """
    params = {"country": country, "brewery": brewery, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()