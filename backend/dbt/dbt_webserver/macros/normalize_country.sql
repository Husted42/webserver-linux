/*
    This macro fixes spelling erros and language issues in raw data
*/

{% macro normalize_country(column_name) %}
    CASE
        {% set country_map = {
            'dk': 'Denmark',
            'danmark': 'Denmark',
            'dannark': 'Denmark',
            'danamrk': 'Denmark',
            'denmark': 'Denmark',
            'amerika': 'United States',
            'england': 'England',
            'kina': 'China',
            'usa': 'United States',
            'italien': 'Italy',
            'tjekkiet': 'Czech Republic',
            'polen': 'Poland',
            'spanien': 'Spain',
            'belgium': 'Belgium',
            'belgien': 'Belgium',
            'estland': 'Estonia',
            'tyskland': 'Germany',
            'frankrig': 'France',
            'danmrk': 'Denmark',
            'mexico': 'Mexico',
            'holland': 'Netherlands',
            'ukraine': 'Ukraine'
        } %}
        {% for source_country, normalized_country in country_map.items() %}
        WHEN LOWER(TRIM({{ column_name }})) = '{{ source_country }}' THEN '{{ normalized_country }}'
        {% endfor %}
        ELSE INITCAP(TRIM({{ column_name }}))
    END
{% endmacro %}
