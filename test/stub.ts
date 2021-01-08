const transformer = {
  process(): string {
    return 'module.exports = {};'
  },
  getCacheKey(): string {
    return 'stub'
  },
}

export default transformer
