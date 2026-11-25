// The landing is its own site; the demo wallet/story/ops live in the Innate_Odylytics web/ app at VITE_DEMO_URL.
export const API_URL = (import.meta.env.VITE_API_URL ?? 'https://nhip-api-taupe.vercel.app').replace(/\/$/, '')
const DEMO_URL = (import.meta.env.VITE_DEMO_URL ?? 'http://localhost:5173').replace(/\/$/, '')
export const demo = (route: string) => `${DEMO_URL}/${route}`
