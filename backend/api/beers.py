from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from .database import get_connection

router = APIRouter(prefix="/api/beers", tags=["beers"])

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
