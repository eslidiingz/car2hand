-- Add PPV (Pickup Passenger Vehicle — รถ SUV ที่ใช้ chassis กระบะ
-- เช่น Toyota Fortuner, Mitsubishi Pajero Sport, Isuzu MU-X) to the
-- BodyType enum so the existing PPV filter on the homepage actually
-- returns listings instead of always-empty results.
ALTER TYPE "BodyType" ADD VALUE IF NOT EXISTS 'PPV';
