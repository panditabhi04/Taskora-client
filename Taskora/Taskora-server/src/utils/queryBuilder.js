const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildQueryOptions = ({
  queryParams,
  searchFields = [],
  filterFields = [],
  sortFields = [],
  searchConditions = [],
  defaultSort = "createdAt",
  defaultOrder = "desc",
}) => {
  const {
    search = "",
    page = 1,
    limit = 10,
    sortBy = defaultSort,
    order = defaultOrder,
  } = queryParams;

  const filters = {};

  //  Search
  if (search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");

    const conditions = searchFields.map((field) => ({
      [field]: regex,
    }));

    filters.$or = [...conditions, ...searchConditions];
  }

  // Filters
  for (const field of filterFields) {
    const value = queryParams[field];

    if (value !== undefined && value !== "") {
      filters[field] = value;
    }
  }

  // Sorting (allowlisted fields only)
  const safeSortBy = sortFields.includes(sortBy)
    ? sortBy
    : defaultSort;

  const safeOrder = order === "asc" ? 1 : -1;

  const sort = {
    [safeSortBy]: safeOrder,
  };

  //  Pagination
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(
    100,
    Math.max(1, parseInt(limit, 10) || 10)
  );

  return {
    filters,
    sort,
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};