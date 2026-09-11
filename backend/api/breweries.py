from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from .database import get_connection

router = APIRouter(prefix="/api/breweries", tags=["breweries"])


@router.get("/countries")
def list_countries():
    query = """
        SELECT DISTINCT country
        FROM beerlist.mart__brewery
        WHERE country IS NOT NULL
        ORDER BY country
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            return [row["country"] for row in cursor.fetchall()]


@router.get("/names")
def list_brewery_names():
    query = """
        SELECT DISTINCT brewery
        FROM beerlist.mart__brewery
        WHERE brewery IS NOT NULL
        ORDER BY brewery
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            return [row["brewery"] for row in cursor.fetchall()]


@router.get("/")
def list_breweries(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    query = """
        SELECT id, brewery_key, brewery, country, inserted_at, inserted_by
        FROM beerlist.mart__brewery
        ORDER BY brewery, country
        LIMIT %s OFFSET %s
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, (limit, offset))
            return cursor.fetchall()


@router.get("/{brewery_key}")
def get_brewery(brewery_key: UUID):
    query = """
        SELECT id, brewery_key, brewery, country, inserted_at, inserted_by
        FROM beerlist.mart__brewery
        WHERE brewery_key = %s
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, (brewery_key,))
            brewery = cursor.fetchone()

    if brewery is None:
        raise HTTPException(status_code=404, detail="Brewery not found")

    return brewery
