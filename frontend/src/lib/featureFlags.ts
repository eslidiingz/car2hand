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

/**
 * PACKAGES_ENABLED — gate for all package / slot monetisation UI on the public
 * frontend: the /profile/packages page, the "แพ็กเกจของฉัน" menu item, package
 * usage bars + upgrade/buy-slot CTAs in /profile/listings and /profile/dashboard,
 * the pricing table on /sell, and the listing-limit upgrade modal in
 * /sell/create.
 *
 * While this is `false`:
 *   - Basic stays capped at 3 listings (its normal limit)
 *   - Backend package routes + DB rows remain intact — only entry points hide
 *
 * Flip to `true` in the next phase when packages go live.
 */
export const PACKAGES_ENABLED = false;
