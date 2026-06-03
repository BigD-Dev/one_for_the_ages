CREATE OR REPLACE FUNCTION ofta_prod.ofta_calculate_age(dob DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, dob))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION ofta_prod.ofta_calculate_age(DATE)
    IS 'Returns the current integer age in years for a given date of birth';
