-- Payments switch to Flutterwave and can be in dollars: amounts are now kept in minor units
-- (kobo, cents) so prices like $4.99 stay exact. Existing naira amounts are converted.
UPDATE "Payment" SET "amount" = "amount" * 100, "discount" = "discount" * 100;
