// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    // A1
    'bg-green-200','text-green-800',
    // A2
    'bg-green-300','text-green-900',
    // B1
    'bg-yellow-200','text-yellow-800',
    // B2
    'bg-yellow-300','text-yellow-900',
    // C1
    'bg-red-200','text-red-800',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
