"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type DashboardFilters = {
  country: string;
  brewery: string;
  type: string;
};

export const emptyFilters: DashboardFilters = {
  country: "",
  brewery: "",
  type: "",
};

type Props = {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
};

function buildQuery(params: Record<string, string>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export default function Filters({ filters, onChange }: Props) {
  const [countries, setCountries] = useState<string[]>([]);
  const [breweries, setBreweries] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Each dropdown's options are scoped to the other two selections, so a
  // pick can never lead to an empty combination.
  useEffect(() => {
    let cancelled = false;

    fetch(
      `${API_URL}/api/breweries/countries${buildQuery({
        brewery: filters.brewery,
        type: filters.type,
      })}`,
    )
      .then((res) => res.json())
      .then((rows: string[]) => {
        if (cancelled) return;
        setCountries(rows);
        if (filters.country && !rows.includes(filters.country)) {
          onChange({ ...filters, country: "" });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.brewery, filters.type]);

  useEffect(() => {
    let cancelled = false;

    fetch(
      `${API_URL}/api/breweries/names${buildQuery({
        country: filters.country,
        type: filters.type,
      })}`,
    )
      .then((res) => res.json())
      .then((rows: string[]) => {
        if (cancelled) return;
        setBreweries(rows);
        if (filters.brewery && !rows.includes(filters.brewery)) {
          onChange({ ...filters, brewery: "" });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.country, filters.type]);

  useEffect(() => {
    let cancelled = false;

    fetch(
      `${API_URL}/api/beers/types${buildQuery({
        country: filters.country,
        brewery: filters.brewery,
      })}`,
    )
      .then((res) => res.json())
      .then((rows: string[]) => {
        if (cancelled) return;
        setTypes(rows);
        if (filters.type && !rows.includes(filters.type)) {
          onChange({ ...filters, type: "" });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.country, filters.brewery]);

  const handleChange =
    (key: keyof DashboardFilters) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...filters, [key]: event.target.value });
    };

  return (
    <div className="filter-bar">
      <select
        className="filter-select"
        value={filters.country}
        onChange={handleChange("country")}
        aria-label="Filter by country"
      >
        <option value="">All countries</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.brewery}
        onChange={handleChange("brewery")}
        aria-label="Filter by brewery"
      >
        <option value="">All breweries</option>
        {breweries.map((brewery) => (
          <option key={brewery} value={brewery}>
            {brewery}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.type}
        onChange={handleChange("type")}
        aria-label="Filter by type"
      >
        <option value="">All types</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
