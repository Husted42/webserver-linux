import BeersExplorer, {
  type BeerSortBy,
  type BeerSortOrder,
} from "./BeersExplorer";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function parseSortBy(value: string): BeerSortBy {
  if (value === "brewery" || value === "rating" || value === "alcohol") {
    return value;
  }
  return "name";
}

function parseSortOrder(value: string): BeerSortOrder {
  return value === "desc" ? "desc" : "asc";
}

export default async function BeersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const minRating = firstValue(params.min_rating);
  const parsedMinRating = Number(minRating);

  return (
    <BeersExplorer
      initialFilters={{
        country: firstValue(params.country),
        brewery: firstValue(params.brewery),
        type: firstValue(params.type),
      }}
      initialSearch={firstValue(params.search)}
      initialMinRating={
        minRating && Number.isFinite(parsedMinRating) ? minRating : ""
      }
      initialSortBy={parseSortBy(firstValue(params.sort_by))}
      initialSortOrder={parseSortOrder(firstValue(params.sort_order))}
    />
  );
}
