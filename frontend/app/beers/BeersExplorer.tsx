"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Filters, {
  type DashboardFilters,
} from "../beerlist/Filters";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_SIZE = 24;

export type BeerSortBy = "name" | "brewery" | "rating" | "alcohol";
export type BeerSortOrder = "asc" | "desc";

type Beer = {
  id: string;
  name: string | null;
  type: string | null;
  alcohol: number | null;
  rating: number | null;
  brewery: string | null;
  country: string | null;
};

type BeerResults = {
  items: Beer[];
  total: number;
  limit: number;
  offset: number;
};

type Props = {
  initialFilters: DashboardFilters;
  initialSearch: string;
  initialMinRating: string;
  initialSortBy: BeerSortBy;
  initialSortOrder: BeerSortOrder;
};

function buildQuery(
  filters: DashboardFilters,
  search: string,
  minRating: string,
  sortBy: BeerSortBy,
  sortOrder: BeerSortOrder,
  offset: number,
) {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.brewery) params.set("brewery", filters.brewery);
  if (filters.type) params.set("type", filters.type);
  if (search.trim()) params.set("search", search.trim());
  if (minRating && Number.isFinite(Number(minRating))) {
    params.set("min_rating", minRating);
  }
  params.set("sort_by", sortBy);
  params.set("sort_order", sortOrder);
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));
  return params;
}

export default function BeersExplorer({
  initialFilters,
  initialSearch,
  initialMinRating,
  initialSortBy,
  initialSortOrder,
}: Props) {
  const [filters, setFilters] = useState(initialFilters);
  const [search, setSearch] = useState(initialSearch);
  const [minRating, setMinRating] = useState(initialMinRating);
  const [sortBy, setSortBy] = useState<BeerSortBy>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<BeerSortOrder>(initialSortOrder);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<BeerResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = buildQuery(
      filters,
      search,
      minRating,
      sortBy,
      sortOrder,
      page * PAGE_SIZE,
    );
    const query = params.toString();
    window.history.replaceState(null, "", `/beers?${query}`);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      fetch(`${API_URL}/api/beers?${query}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Beer list request failed (${response.status}).`);
          }
          return (await response.json()) as BeerResults;
        })
        .then((data) => {
          setResults(data);
        })
        .catch((requestError: unknown) => {
          if (controller.signal.aborted) return;
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Unable to load the beer list.";
          setError(message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [filters, search, minRating, sortBy, sortOrder, page]);

  const pageCount = results ? Math.ceil(results.total / PAGE_SIZE) : 0;

  function resetFilters() {
    setFilters({ country: "", brewery: "", type: "" });
    setSearch("");
    setMinRating("");
    setSortBy("name");
    setSortOrder("asc");
    setPage(0);
  }

  return (
    <main className="beer-explorer">
      <header className="beer-explorer-header">
        <div>
          <p className="eyebrow">The Beer List</p>
          <h1>The list</h1>
          <p className="subtitle">
            It wouldn't be a list without a list.
          </p>
        </div>
        <Link className="explorer-back-link" href="/beerlist">
          Back to analytics
        </Link>
      </header>

      <section className="explorer-panel" aria-label="Beer list">
        <div className="explorer-panel-header">
          <div>
            <p className="panel-kicker">Browse</p>
            <h2>Beers</h2>
          </div>
          <p className="explorer-count" aria-live="polite">
            {loading
              ? "Updating list…"
              : `${(results?.total ?? 0).toLocaleString()} beers`}
          </p>
        </div>

        <div className="explorer-controls">
          <Filters
            filters={filters}
            onChange={(nextFilters) => {
              setFilters(nextFilters);
              setPage(0);
            }}
          />

          <label className="explorer-field explorer-search">
            <span>Search</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Beer, brewery, country…"
            />
          </label>

          <label className="explorer-field explorer-rating-filter">
            <span>Minimum rating</span>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={minRating}
              onChange={(event) => {
                setMinRating(event.target.value);
                setPage(0);
              }}
              placeholder="Any"
            />
          </label>

          <label className="explorer-field explorer-sort">
            <span>Sort by</span>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(event) => {
                const [nextSortBy, nextSortOrder] =
                  event.target.value.split(":") as [BeerSortBy, BeerSortOrder];
                setSortBy(nextSortBy);
                setSortOrder(nextSortOrder);
                setPage(0);
              }}
            >
              <option value="name:asc">Name A–Z</option>
              <option value="rating:desc">Rating high to low</option>
              <option value="rating:asc">Rating low to high</option>
              <option value="alcohol:desc">Alcohol high to low</option>
              <option value="alcohol:asc">Alcohol low to high</option>
              <option value="brewery:asc">Brewery A–Z</option>
            </select>
          </label>

          <button className="explorer-reset" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {error && (
          <p className="explorer-error" role="alert">
            {error}
          </p>
        )}

        {results?.items.length ? (
          <div className="beer-table-wrap" aria-busy={loading}>
            <table className="beer-table">
              <thead>
                <tr>
                  <th scope="col">Beer</th>
                  <th scope="col">Brewery</th>
                  <th scope="col">Country</th>
                  <th scope="col">Style</th>
                  <th scope="col">Alcohol</th>
                  <th scope="col">Rating</th>
                </tr>
              </thead>
              <tbody>
                {results.items.map((beer) => (
                  <tr key={beer.id}>
                    <td className="beer-title">{beer.name || "Untitled beer"}</td>
                    <td>{beer.brewery || "—"}</td>
                    <td>{beer.country || "—"}</td>
                    <td>
                      {beer.type ? (
                        <span className="beer-style-tag">{beer.type}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {beer.alcohol === null
                        ? "—"
                        : `${beer.alcohol.toFixed(1)}%`}
                    </td>
                    <td>
                      {beer.rating === null ? (
                        "—"
                      ) : (
                        <span className="beer-rating">
                          {beer.rating.toFixed(2)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="explorer-empty">
              <span aria-hidden="true">🍺</span>
              <h3>No beers match these filters</h3>
              <p>Try a different search or clear some filters.</p>
            </div>
          )
        )}

        <footer className="explorer-pagination">
          <span>
            {results && results.total > 0
              ? `Page ${page + 1} of ${pageCount}`
              : "No results"}
          </span>
          <div>
            <button
              type="button"
              className="pagination-button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0 || loading}
            >
              Previous
            </button>
            <button
              type="button"
              className="pagination-button"
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              disabled={pageCount === 0 || page >= pageCount - 1 || loading}
            >
              Next
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
