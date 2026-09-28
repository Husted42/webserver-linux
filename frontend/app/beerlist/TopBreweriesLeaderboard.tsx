"use client";

import { useEffect, useState } from "react";
import { emptyFilters, type DashboardFilters } from "./Filters";

type BreweryRanking = {
  brewery: string;
  country: string;
  avg_rating: number;
  beer_count: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MEDALS = ["🥇", "🥈", "🥉"];

type Props = {
  filters?: DashboardFilters;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function TopBreweriesLeaderboard({ filters = emptyFilters }: Props) {
  const [data, setData] = useState<BreweryRanking[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);

    const params = new URLSearchParams();
    if (filters.country) params.set("country", filters.country);
    if (filters.brewery) params.set("brewery", filters.brewery);
    if (filters.type) params.set("type", filters.type);

    fetch(`${API_URL}/api/analytics/top-breweries?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((rows: BreweryRanking[]) => {
        if (!cancelled) setData(rows);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [filters.country, filters.brewery, filters.type]);

  if (error) {
    return <div className="chart-placeholder">Couldn&apos;t load brewery rankings</div>;
  }

  if (!data) {
    return <div className="chart-placeholder">Loading rankings…</div>;
  }

  if (data.length === 0) {
    return <div className="chart-placeholder">No breweries match these filters</div>;
  }

  const podium = data.slice(0, 3);
  const rest = data.slice(3, 10);
  // Center the #1 card by rendering the podium in 2nd, 1st, 3rd order.
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div className="leaderboard">
      <div className="podium">
        {podiumOrder.map((entry) => {
          const rank = podium.indexOf(entry) + 1;
          return (
            <div
              className={`podium-card podium-rank-${rank}`}
              key={`${rank}-${entry.brewery}-${entry.country}`}
            >
              <span className="podium-medal">{MEDALS[rank - 1]}</span>
              <span className="podium-avatar">{initials(entry.brewery)}</span>
              <span className="podium-name">{entry.brewery}</span>
              <span className="podium-country">{entry.country}</span>
              <span className="podium-rating">{entry.avg_rating.toFixed(2)}★</span>
              <span className="podium-count">{entry.beer_count} beers</span>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <ol className="leaderboard-list" start={4}>
          {rest.map((entry, index) => (
              <li
                className="leaderboard-row"
                key={`${index + 4}-${entry.brewery}-${entry.country}`}
              >
              <span className="leaderboard-rank">#{index + 4}</span>
              <span className="leaderboard-avatar">{initials(entry.brewery)}</span>
              <span className="leaderboard-name">{entry.brewery}</span>
              <span className="leaderboard-country">{entry.country}</span>
              <span className="leaderboard-rating">{entry.avg_rating.toFixed(2)}★</span>
              <span className="leaderboard-count">{entry.beer_count} beers</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
