"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { emptyFilters, type DashboardFilters } from "./Filters";

/*
    TODO: Add the ability to see different beers when we filter on brewery
*/

const Plot = dynamic(() => import("./PlotClient"), { ssr: false });

type CountryRating = {
  country: string;
  avg_rating: number;
  beer_count: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Props = {
  filters?: DashboardFilters;
};

export default function RatingByCountryChart({ filters = emptyFilters }: Props) {
  const [data, setData] = useState<CountryRating[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);

    const params = new URLSearchParams();
    if (filters.country) params.set("country", filters.country);
    if (filters.brewery) params.set("brewery", filters.brewery);
    if (filters.type) params.set("type", filters.type);

    fetch(`${API_URL}/api/analytics/avg-rating-by-country?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((rows: CountryRating[]) => {
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
    return <div className="chart-placeholder">Couldn&apos;t load rating data</div>;
  }

  if (!data) {
    return <div className="chart-placeholder">Loading chart…</div>;
  }

  const sorted = [...data].sort((a, b) => b.avg_rating - a.avg_rating);

  return (
    <div className="chart-canvas">
      <Plot
        data={[
          {
            type: "bar",
            x: sorted.map((row) => row.country),
            y: sorted.map((row) => row.avg_rating),
            marker: { color: "#ff9500" },
            hovertemplate:
              "<b>%{x}</b><br>Avg rating: %{y}<br>Beers: %{customdata}<extra></extra>",
            customdata: sorted.map((row) => row.beer_count),
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 44, r: 16, t: 16, b: 70 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { family: "Inter, system-ui, sans-serif", color: "#b8b8b8" },
          xaxis: {
            type: "category",
            tickmode: "linear",
            dtick: 1,
            tickangle: -35,
            automargin: true,
            color: "#b8b8b8",
            gridcolor: "rgba(255,255,255,0.09)",
          },
          yaxis: {
            title: { text: "Avg rating" },
            color: "#b8b8b8",
            gridcolor: "rgba(255,255,255,0.09)",
            zerolinecolor: "rgba(255,255,255,0.09)",
          },
          bargap: 0.3,
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
