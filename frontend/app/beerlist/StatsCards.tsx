"use client";

import { useEffect, useState } from "react";
import { emptyFilters, type DashboardFilters } from "./Filters";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Props = {
  filters?: DashboardFilters;
};

type Counts = {
  beer_count: number;
  brewery_count: number;
  country_count: number;
};

export default function StatsCards({ filters = emptyFilters }: Props) {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (filters.country) params.set("country", filters.country);
    if (filters.brewery) params.set("brewery", filters.brewery);
    if (filters.type) params.set("type", filters.type);
    const query = params.toString() ? `?${params.toString()}` : "";

    Promise.all([
      fetch(`${API_URL}/api/analytics/beer-count${query}`).then((res) => res.json()),
      fetch(`${API_URL}/api/analytics/brewery-count${query}`).then((res) => res.json()),
      fetch(`${API_URL}/api/analytics/country-count${query}`).then((res) => res.json()),
    ])
      .then(([beers, breweries, countries]) => {
        if (cancelled) return;
        setCounts({
          beer_count: beers.beer_count,
          brewery_count: breweries.brewery_count,
          country_count: countries.country_count,
        });
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      });

    return () => {
      cancelled = true;
    };
  }, [filters.country, filters.brewery, filters.type]);

  const stats = [
    { label: "Different Beers", value: counts?.beer_count },
    { label: "Different Breweries", value: counts?.brewery_count },
    { label: "Different Countries", value: counts?.country_count },
  ];

  return (
    <section className="stats-grid">
      {stats.map((stat) => (
        <article className="stat-card" key={stat.label}>
          <span className="stat-value">{stat.value ?? "–"}</span>
          <span className="stat-label">{stat.label}</span>
        </article>
      ))}
    </section>
  );
}
