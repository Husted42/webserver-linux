from typing import Literal

from fastapi import APIRouter, Query

from .database import get_connection

router = APIRouter(prefix="/api/beers", tags=["beers"])


@router.get("")
def list_beers(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
    search: str | None = Query(default=None, max_length=100),
    min_rating: float | None = Query(default=None, ge=0, le=10),
    sort_by: Literal["name", "brewery", "rating", "alcohol"] = Query(default="name"),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    limit: int = Query(default=24, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    search = search.strip() if search and search.strip() else None
    params = {
        "country": country,
        "brewery": brewery,
        "type": type,
        "search": search,
        "min_rating": min_rating,
    }
    sort_columns = {
        "name": "lower(name)",
        "brewery": "lower(brewery)",
        "rating": "rating",
        "alcohol": "alcohol",
    }
    sort_column = sort_columns[sort_by]
    sort_direction = sort_order.upper()
    filtered_beers_query = """
        SELECT
            beer.beer_key AS id,
            max(beer.name) AS name,
            max(beer.type) AS type,
            avg(beer.alcohol::numeric) AS alcohol,
            avg(beer.rating::numeric) AS rating,
            max(brewery.brewery) AS brewery,
            max(brewery.country) AS country
        FROM beerlist.mart__beers AS beer
        INNER JOIN beerlist.mart__brewery AS brewery
            ON beer.brewery_key = brewery.brewery_key
        WHERE (%(country)s::text IS NULL OR brewery.country = %(country)s::text)
            AND (%(brewery)s::text IS NULL OR brewery.brewery = %(brewery)s::text)
            AND (%(type)s::text IS NULL OR beer.type = %(type)s::text)
            AND (
                %(search)s::text IS NULL
                OR strpos(lower(coalesce(beer.name, '')), lower(%(search)s::text)) > 0
                OR strpos(lower(coalesce(brewery.brewery, '')), lower(%(search)s::text)) > 0
                OR strpos(lower(coalesce(brewery.country, '')), lower(%(search)s::text)) > 0
                OR strpos(lower(coalesce(beer.type, '')), lower(%(search)s::text)) > 0
            )
        GROUP BY beer.beer_key, brewery.brewery_key
        HAVING (%(min_rating)s::numeric IS NULL OR avg(beer.rating::numeric) >= %(min_rating)s::numeric)
    """
    count_query = f"SELECT count(*) AS total FROM ({filtered_beers_query}) AS filtered_beers"
    beers_query = f"""
        SELECT
            id,
            name,
            type,
            alcohol,
            rating,
            brewery,
            country
        FROM ({filtered_beers_query}) AS filtered_beers
        ORDER BY {sort_column} {sort_direction} NULLS LAST, lower(name) ASC, lower(brewery) ASC, id
        LIMIT %(limit)s OFFSET %(offset)s
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(count_query, params)
            total = cursor.fetchone()["total"]

            cursor.execute(
                beers_query,
                {**params, "limit": limit, "offset": offset},
            )
            items = cursor.fetchall()

    return {"items": items, "total": total, "limit": limit, "offset": offset}


'''
    This is used for the dropdown showing the list of beer types.
    Filters.tsx
'''
@router.get("/types")
def list_beer_types(
    country: str | None = Query(default=None),
    brewery: str | None = Query(default=None),
):
    query = """
        SELECT DISTINCT beer.type
        FROM beerlist.mart__beers AS beer
        INNER JOIN beerlist.mart__brewery AS brewery
            ON beer.brewery_key = brewery.brewery_key
        WHERE beer.type IS NOT NULL
            AND (%(country)s::text IS NULL OR brewery.country = %(country)s::text)
            AND (%(brewery)s::text IS NULL OR brewery.brewery = %(brewery)s::text)
        ORDER BY beer.type
    """
    params = {"country": country, "brewery": brewery}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return [row["type"] for row in cursor.fetchall()]
