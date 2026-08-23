// app/page.tsx

const stats = [
  { label: "Different Beers", value: 128 },
  { label: "Different Breweries", value: 42 },
  { label: "Different Countries", value: 18 },
];

export default function Home() {
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

        <button className="primary-button">
          View data
        </button>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Countries</p>
              <h2>Average rating by country</h2>
            </div>

            <button className="secondary-button">Explore</button>
          </div>

          <div className="chart-placeholder">
            Chart goes here
          </div>
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