-- Add nullable `seats` to vehicle_sub_models so the listing auto-enrich
-- (ensureModelAndSubModel) can persist seat count alongside engineSize /
-- fuelType / transmission. Nullable → safe, no backfill of existing rows.
ALTER TABLE "vehicle_sub_models" ADD COLUMN "seats" INTEGER;
