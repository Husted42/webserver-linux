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

export default function Filters({ filters, onChange }: Props) {
  const [countries, setCountries] = useState<string[]>([]);
  const [breweries, setBreweries] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`${API_URL}/api/breweries/countries`).then((res) => res.json()),
      fetch(`${API_URL}/api/breweries/names`).then((res) => res.json()),
      fetch(`${API_URL}/api/beers/types`).then((res) => res.json()),
    ])
      .then(([countryRows, breweryRows, typeRows]) => {
        if (cancelled) return;
        setCountries(countryRows);
        setBreweries(breweryRows);
        setTypes(typeRows);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

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
