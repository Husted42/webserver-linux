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