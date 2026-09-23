from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from .database import get_connection

router = APIRouter(prefix="/api/breweries", tags=["breweries"])

'''
    This is used for the dropdown showing the list of countries.
    Filters.tsx
'''
@router.get("/countries")
def list_countries(
    brewery: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        SELECT DISTINCT brewery.country
        FROM beerlist.mart__brewery AS brewery
        INNER JOIN beerlist.mart__beers AS beer
            ON beer.brewery_key = brewery.brewery_key
        WHERE brewery.country IS NOT NULL
            AND (%(brewery)s::text IS NULL OR brewery.brewery = %(brewery)s::text)
            AND (%(type)s::text IS NULL OR beer.type = %(type)s::text)
        ORDER BY brewery.country
    """
    params = {"brewery": brewery, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return [row["country"] for row in cursor.fetchall()]

'''
    This is used for the dropdown showing the list of brewery names.
    Filters.tsx
'''
@router.get("/names")
def list_brewery_names(
    country: str | None = Query(default=None),
    type: str | None = Query(default=None),
):
    query = """
        SELECT DISTINCT brewery.brewery
        FROM beerlist.mart__brewery AS brewery
        INNER JOIN beerlist.mart__beers AS beer
            ON beer.brewery_key = brewery.brewery_key
        WHERE brewery.brewery IS NOT NULL
            AND (%(country)s::text IS NULL OR brewery.country = %(country)s::text)
            AND (%(type)s::text IS NULL OR beer.type = %(type)s::text)
        ORDER BY brewery.brewery
    """
    params = {"country": country, "type": type}

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return [row["brewery"] for row in cursor.fetchall()]
