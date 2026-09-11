from fastapi import APIRouter, Query

from .database import get_connection

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/breweries-by-country")
def breweries_by_country():
    query = """
        select *
        from beerlist.analytics__brewery_by_country
        order by brewery_count desc;
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            return cursor.fetchall()


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
