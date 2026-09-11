from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from .database import get_connection

router = APIRouter(prefix="/api/beers", tags=["beers"])


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


@router.get("/")
def list_beers(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    query = """
        SELECT id, beer_key, brewery_key, name, type, alcohol, rating, inserted_at, inserted_by
        FROM beerlist.mart__beers
        ORDER BY name
        LIMIT %s OFFSET %s
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, (limit, offset))
            return cursor.fetchall()


@router.get("/{beer_key}")
def get_beer(beer_key: UUID):
    query = """
        SELECT id, beer_key, brewery_key, name, type, alcohol, rating, inserted_at, inserted_by
        FROM beerlist.mart__beers
        WHERE beer_key = %s
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, (beer_key,))
            beer = cursor.fetchone()

    if beer is None:
        raise HTTPException(status_code=404, detail="Beer not found")

    return beer
