-- The website's waitlist form calls this straight from the browser (Supabase's /rest/v1/rpc/join_waitlist,
-- with the publishable key), so joining doesn't wait on the API server. The table itself stays closed
-- (row level security, no policies): this function is the only way in, and it can only add people.
-- Signing up again with the same email keeps the first place in line.
CREATE OR REPLACE FUNCTION public.join_waitlist(
  p_name text,
  p_email text,
  p_role text,
  p_country text DEFAULT NULL,
  p_interests text[] DEFAULT '{}',
  p_source text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := trim(coalesce(p_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_created timestamp(3);
  v_already boolean := false;
BEGIN
  IF v_name = '' OR length(v_name) > 80 THEN
    RAISE EXCEPTION 'Please tell us your name.' USING ERRCODE = '22023';
  END IF;
  IF length(v_email) > 200 OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.' USING ERRCODE = '22023';
  END IF;
  IF p_role IS NULL OR p_role NOT IN ('student', 'parent', 'teacher', 'school', 'other') THEN
    RAISE EXCEPTION 'Please choose who you are.' USING ERRCODE = '22023';
  END IF;

  SELECT "createdAt" INTO v_created FROM "WaitlistEntry" WHERE email = v_email;
  IF FOUND THEN
    v_already := true;
  ELSE
    INSERT INTO "WaitlistEntry" (id, email, name, role, country, interests, source)
    VALUES (
      gen_random_uuid()::text,
      v_email,
      v_name,
      p_role,
      nullif(left(trim(coalesce(p_country, '')), 60), ''),
      coalesce(
        (SELECT array_agg(DISTINCT i) FROM unnest(coalesce(p_interests, '{}')) AS i
          WHERE i IN ('jamb', 'waec', 'neco', 'university', 'skills', 'languages')),
        '{}'
      ),
      nullif(left(trim(coalesce(p_source, '')), 80), '')
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING "createdAt" INTO v_created;
    -- Someone else signed up with this email at the same moment.
    IF v_created IS NULL THEN
      SELECT "createdAt" INTO v_created FROM "WaitlistEntry" WHERE email = v_email;
      v_already := true;
    END IF;
  END IF;

  RETURN json_build_object(
    'ok', true,
    'already', v_already,
    'position', (SELECT count(*) FROM "WaitlistEntry" WHERE "createdAt" <= v_created)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.join_waitlist(text, text, text, text, text[], text) FROM PUBLIC;

-- Supabase's roles (missing in a plain local Postgres, where this is skipped).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    GRANT EXECUTE ON FUNCTION public.join_waitlist(text, text, text, text, text[], text) TO anon, authenticated;
  END IF;
END
$$;
