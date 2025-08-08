// postcss.config.cjs
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(),  // ← note the () here!
    require('autoprefixer'),
  ]
}
