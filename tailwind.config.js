/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'node-client': '#3B82F6',
        'node-dns': '#8B5CF6',
        'node-cdn': '#F59E0B',
        'node-lb': '#10B981',
        'node-gateway': '#6366F1',
        'node-service': '#EC4899',
        'node-cache': '#EF4444',
        'node-db': '#0EA5E9',
        'node-queue': '#F97316',
        'node-auth': '#14B8A6',
        'node-dc': '#64748B',
      },
    },
  },
  plugins: [],
}
