/**
 * Public-facing feature flags.
 *
 * Use these to hide UI for features that aren't ready for this phase but
 * whose backend code and database schema should remain intact.
 */

/**
 * MOTORCYCLE_ENABLED — gate for all motorcycle-related UI (homepage section,
 * vehicleType toggle in /buy, /sell, /sell/estimate).
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
 * the pricing table on /sellLandingPage, and the listing-limit upgrade
 * modal in /sell.
 *
 * While this is `false`:
 *   - Basic stays capped at 3 listings (its normal limit)
 *   - Backend package routes + DB rows remain intact — only entry points hide
 *
 * Flip to `true` in the next phase when packages go live.
 */
export const PACKAGES_ENABLED = false;

/**
 * LISTING_EXTRA_SECTIONS_ENABLED — gate for the optional, friction-adding
 * sections in the /sell create flow:
 *   - "ข้อมูลเพิ่มเติม" (Vehicle Extras) in step 1 — tax/spare-key checkboxes,
 *     insurance/warranty/BSI free-text, and the service-history image upload
 *   - "สำเนาเล่มทะเบียนรถ" (registration-book image) in step 2
 *
 * Hidden to keep the listing flow short and lift completion rate. Backend
 * fields, upload endpoints (`/listings/:id/service-history`,
 * `/listings/:id/registration-book`) and DB columns stay intact — only the
 * form UI hides, and the create/upload calls are already null-guarded so a
 * listing simply omits these when the flag is off.
 *
 * Flip to `true` to bring the richer (longer) form back.
 */
export const LISTING_EXTRA_SECTIONS_ENABLED = false;
