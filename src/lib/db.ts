/**
 * Canonical MongoDB connection singleton for the Blockhay project.
 * Used by all server-side data fetching (RSC, API routes, seed scripts).
 *
 * Re-exports connectDB from the underlying implementation so import paths
 * consistently use `@/lib/db` throughout the codebase.
 */
export { connectDB } from "./mongodb";
