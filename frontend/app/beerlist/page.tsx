// app/page.tsx

"use client";

import { useState } from "react";
import Filters, { emptyFilters, type DashboardFilters } from "./Filters";
import RatingByCountryChart from "./RatingByCountryChart";
import StatsCards from "./StatsCards";

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters>(emptyFilters);

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Beer Analytics</p>
          <h1>Your beer data, at a glance.</h1>
          <p className="subtitle">
            Explore breweries, countries, ratings and tasting trends.
          </p>
        </div>

        <div className="header-actions">
          <Filters filters={filters} onChange={setFilters} />

          <button className="primary-button">
            View data
          </button>
        </div>
      </section>

      <StatsCards filters={filters} />

      <section className="content-grid">
        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Countries</p>
              <h2>Average rating by country</h2>
            </div>

            <button className="secondary-button">Explore</button>
          </div>

          <RatingByCountryChart filters={filters} />
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Distribution</p>
              <h2>Beer styles</h2>
            </div>
          </div>

          <div className="chart-placeholder compact">
            Donut chart
          </div>
        </article>

        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Breweries</p>
              <h2>Top breweries</h2>
            </div>
          </div>

          <div className="chart-placeholder">
            Brewery chart
          </div>
        </article>

        <article className="panel highlight-panel">
          <p className="panel-kicker">Collection</p>
          <h2>Keep discovering.</h2>
          <p>
            Your dashboard can later contain recommendations, recent additions,
            favourites or other interactive data.
          </p>
        </article>
      </section>
    </main>
  );
}