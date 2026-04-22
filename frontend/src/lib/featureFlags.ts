/**
 * Public-facing feature flags.
 *
 * Use these to hide UI for features that aren't ready for this phase but
 * whose backend code and database schema should remain intact.
 */

/**
 * MOTORCYCLE_ENABLED — gate for all motorcycle-related UI (homepage section,
 * vehicleType toggle in /buy, /sell/create, /sell/estimate).
 *
 * Set to `true` in a later phase once motorcycle inventory, pricing data,
 * and category pages are ready. Existing MOTORCYCLE listings in the DB
 * remain accessible via direct URL — the flag only hides entry points.
 */
export const MOTORCYCLE_ENABLED = false;
