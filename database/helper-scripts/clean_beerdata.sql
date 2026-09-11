SELECT DISTINCT LOWER(country) FROM beerlist.stg__clean_google_data;

----- ##### Simple SELECTS ##### -----
/*
    Read from sources
*/
SELECT * FROM beerlist.raw_beerlist_google_data;

/*
    Read from staging
*/
SELECT * FROM beerlist.stg__clean_google_data;

/*
    Read from marts
*/
SELECT * FROM beerlist.mart__brewery;
SELECT * FROM beerlist.mart__beers;