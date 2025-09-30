-- Create list_user_boards function that uses auth.uid() and returns boards in a "boards" field
CREATE OR REPLACE FUNCTION public.list_user_boards()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'boards', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', b.id,
                    'name', b.name,
                    'user_id', b.user_id,
                    'created_at', b.created_at,
                    'updated_at', b.updated_at
                )
                ORDER BY b.updated_at DESC
            ),
            '[]'::jsonb
        )
    ) INTO result
    FROM public.boards b
    WHERE b.user_id = auth.uid();
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.list_user_boards() TO authenticated;