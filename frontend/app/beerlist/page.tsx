// app/page.tsx

"use client";

import { useState } from "react";
import Filters, { emptyFilters, type DashboardFilters } from "./Filters";
import RatingByCountryChart from "./RatingByCountryChart";
import BeerStyleDonutChart from "./BeerStyleDonutChart";
import AlcoholRatingChart from "./AlcoholRatingChart";
import TopBreweriesLeaderboard from "./TopBreweriesLeaderboard";
import StatsCards from "./StatsCards";

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters>(emptyFilters);

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Beer Analytics</p>
          <h1>Husted &amp; Holm&apos;s <br/> Beerlist</h1>
          <p className="subtitle">
            From the hardest working livers in the galaxy
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

          <BeerStyleDonutChart filters={filters} />
        </article>

        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Breweries</p>
              <h2>Top breweries</h2>
            </div>
          </div>

          <TopBreweriesLeaderboard filters={filters} />
        </article>

        <article className="panel highlight-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Rating signals</p>
              <h2>Alcohol % and rating</h2>
            </div>
          </div>
          <AlcoholRatingChart filters={filters} />
        </article>
      </section>
    </main>
  );
}