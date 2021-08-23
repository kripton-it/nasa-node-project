const DEFAULT_LIMIT = 0;
const DEFAULT_PAGE = 1;

function getPagination(query) {
  const page = Math.abs(query.page) || DEFAULT_PAGE;
  const limit = Math.abs(query.limit) || DEFAULT_LIMIT;

  const skip = limit * (page - 1);

  return { limit, skip };
}

module.exports = { getPagination };