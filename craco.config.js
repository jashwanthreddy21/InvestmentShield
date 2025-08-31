module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          fs: false,
          path: false,
        },
        // This makes webpack case-insensitive
        symlinks: false,
        cacheWithContext: false
      },
    },
  },
};