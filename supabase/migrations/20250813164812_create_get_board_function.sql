-- Create get_board function to retrieve a board with its lists and cards
CREATE OR REPLACE FUNCTION public.get_board(board_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Get board with nested lists and cards
    SELECT json_build_object(
        'board', json_build_object(
            'id', b.id,
            'name', b.name,
            'user_id', b.user_id,
            'created_at', b.created_at,
            'updated_at', b.updated_at,
            'lists', COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', l.id,
                            'name', l.name,
                            'board_id', l.board_id,
                            'position', l.position,
                            'created_at', l.created_at,
                            'updated_at', l.updated_at,
                            'cards', COALESCE(
                                (
                                    SELECT json_agg(
                                        json_build_object(
                                            'id', c.id,
                                            'title', c.title,
                                            'description', c.description,
                                            'list_id', c.list_id,
                                            'position', c.position,
                                            'created_at', c.created_at,
                                            'updated_at', c.updated_at
                                        )
                                        ORDER BY c.position
                                    )
                                    FROM public.cards c
                                    WHERE c.list_id = l.id
                                ),
                                '[]'::json
                            )
                        )
                        ORDER BY l.position
                    )
                    FROM public.lists l
                    WHERE l.board_id = b.id
                ),
                '[]'::json
            )
        )
    ) INTO result
    FROM public.boards b
    WHERE b.id = board_uuid;

    IF result IS NULL THEN
        RAISE EXCEPTION 'Board not found';
    END IF;

    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_board(UUID) TO authenticated;