"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { emptyFilters, type DashboardFilters } from "./Filters";

const Plot = dynamic(() => import("./PlotClient"), { ssr: false });

type StyleCount = {
  type: string;
  beer_count: number;
  avg_rating: number | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Unrated styles remain visible without contributing to the rating scale.
function colorsByRating(ratings: (number | null | undefined)[]): string[] {
  const rated = ratings.filter((rating): rating is number => rating !== null && Number.isFinite(rating));
  if (rated.length === 0) return ratings.map(() => "#888888");

  const min = Math.min(...rated);
  const max = Math.max(...rated);
  const span = max - min || 1;

  return ratings.map((rating) => {
    if (rating == null || !Number.isFinite(rating)) return "#888888";
    const t = (rating - min) / span;
    const hue = 18 + (32 - 18) * t;
    const light = 30 + (65 - 30) * t;
    return `hsl(${hue}, 90%, ${light}%)`;
  });
}

type Props = {
  filters?: DashboardFilters;
};

export default function BeerStyleDonutChart({ filters = emptyFilters }: Props) {
  const [data, setData] = useState<StyleCount[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);

    const params = new URLSearchParams();
    if (filters.country) params.set("country", filters.country);
    if (filters.brewery) params.set("brewery", filters.brewery);
    if (filters.type) params.set("type", filters.type);

    fetch(`${API_URL}/api/analytics/beer-style-distribution?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((rows: StyleCount[]) => {
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
    return <div className="chart-placeholder">Couldn&apos;t load beer style data</div>;
  }

  if (!data) {
    return <div className="chart-placeholder">Loading chart…</div>;
  }

  return (
    <div className="chart-canvas">
      <Plot
        data={[
          {
            type: "pie",
            hole: 0.55,
            labels: data.map((row) => row.type),
            values: data.map((row) => row.beer_count),
            marker: { colors: colorsByRating(data.map((row) => row.avg_rating)) },
            text: data.map((row) =>
              row.avg_rating == null || !Number.isFinite(row.avg_rating)
                ? "No rating"
                : `${row.avg_rating.toFixed(2)}★`,
            ),
            textinfo: "label+text",
            textposition: "outside",
            automargin: true,
            hovertemplate:
              "<b>%{label}</b><br>Beers: %{value} (%{percent})<br>Avg rating: %{text}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 16, r: 16, t: 16, b: 16 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { family: "Inter, system-ui, sans-serif", color: "#b8b8b8" },
          showlegend: true,
          legend: { orientation: "h", font: { size: 10 } },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
