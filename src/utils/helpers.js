const crypto = require('crypto');

function createToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function parsePagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

function parseSort(query = {}, defaultSortBy = 'createdAt') {
  const sortBy = query.sortBy || defaultSortBy;
  const direction =
    String(query.sortDirection || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  return { [sortBy]: direction };
}

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function buildPageResult(items, total, page, pageSize) {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

module.exports = {
  createToken,
  parsePagination,
  parseSort,
  escapeRegex,
  round2,
  buildPageResult,
};
