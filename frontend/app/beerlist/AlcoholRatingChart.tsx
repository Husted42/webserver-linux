"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { emptyFilters, type DashboardFilters } from "./Filters";

const Plot = dynamic(() => import("./PlotClient"), { ssr: false });

type AlcoholBucket = {
  alcohol_bucket: string;
  bucket_order: number;
  avg_rating: number;
  beer_count: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Props = {
  filters?: DashboardFilters;
};

function buildQuery(filters: DashboardFilters) {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.brewery) params.set("brewery", filters.brewery);
  if (filters.type) params.set("type", filters.type);
  return params.toString();
}

export default function AlcoholRatingChart({ filters = emptyFilters }: Props) {
  const [result, setResult] = useState<{ query: string; rows: AlcoholBucket[] } | null>(null);
  const [errorQuery, setErrorQuery] = useState<string | null>(null);
  const query = buildQuery(filters);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/analytics/rating-by-alcohol${query ? `?${query}` : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((rows: AlcoholBucket[]) => {
        if (!cancelled) {
          setErrorQuery((current) => (current === query ? null : current));
          setResult({ query, rows });
        }
      })
      .catch(() => {
        if (!cancelled) setErrorQuery(query);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (errorQuery === query) {
    return <div className="chart-placeholder">Couldn&apos;t load alcohol and rating data</div>;
  }

  const data = result?.query === query ? result.rows : null;
  if (!data) {
    return <div className="chart-placeholder">Loading chart…</div>;
  }

  if (data.length === 0) {
    return <div className="chart-placeholder">No rated beers with alcohol data</div>;
  }

  const sorted = [...data].sort((a, b) => a.bucket_order - b.bucket_order);

  return (
    <div className="alcohol-rating-chart">
      <Plot
        data={[
          {
            type: "bar",
            x: sorted.map((bucket) => bucket.alcohol_bucket),
            y: sorted.map((bucket) => bucket.avg_rating),
            customdata: sorted.map((bucket) => bucket.beer_count),
            marker: { color: "#fff1d0" },
            hovertemplate:
              "<b>%{x}</b><br>Average rating: %{y:.2f}<br>Beers: %{customdata}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 46, r: 12, t: 12, b: 52 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { family: "Inter, system-ui, sans-serif", color: "#fff1d0", size: 11 },
          xaxis: {
            title: { text: "Alcohol %" },
            color: "#fff1d0",
            gridcolor: "rgba(255,255,255,0.18)",
            zerolinecolor: "rgba(255,255,255,0.18)",
          },
          yaxis: {
            title: { text: "Average rating" },
            color: "#fff1d0",
            gridcolor: "rgba(255,255,255,0.18)",
            zerolinecolor: "rgba(255,255,255,0.18)",
          },
          showlegend: false,
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
