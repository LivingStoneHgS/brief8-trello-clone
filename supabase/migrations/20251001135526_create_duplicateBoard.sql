-- Create duplicate_board function to duplicate a board, its lists, and cards
CREATE OR REPLACE FUNCTION public.duplicate_board(original_board_uuid UUID, new_user_id UUID DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    new_board_id UUID;
    l_row RECORD;
    c_row RECORD;
    old_list_id UUID;
    new_list_id UUID;
    list_id_map JSONB := '{}';
BEGIN
    -- Duplicate the board
    INSERT INTO public.boards (name, user_id, created_at, updated_at)
    SELECT b.name || ' (Copy)',
           COALESCE(new_user_id, b.user_id),
           NOW(),
           NOW()
    FROM public.boards b
    WHERE b.id = original_board_uuid
    RETURNING id INTO new_board_id;

    -- Duplicate lists and build a map from old_list_id to new_list_id
    FOR l_row IN SELECT * FROM public.lists WHERE board_id = original_board_uuid ORDER BY position LOOP
        INSERT INTO public.lists (name, board_id, position, created_at, updated_at)
        VALUES (l_row.name, new_board_id, l_row.position, NOW(), NOW())
        RETURNING id INTO new_list_id;
        -- Store mapping from old_list_id to new_list_id
        list_id_map := list_id_map || jsonb_build_object(l_row.id::text, new_list_id::text);
    END LOOP;

    -- Duplicate cards using the list_id_map
    FOR c_row IN SELECT * FROM public.cards WHERE list_id IN (SELECT id FROM public.lists WHERE board_id = original_board_uuid) ORDER BY position LOOP
        old_list_id := c_row.list_id;
        new_list_id := (list_id_map ->> old_list_id::text)::UUID;
        INSERT INTO public.cards (title, description, list_id, position, created_at, updated_at)
        VALUES (c_row.title, c_row.description, new_list_id, c_row.position, NOW(), NOW());
    END LOOP;

    RETURN new_board_id;
END;
$$;

-- -- Grant execute permission to authenticated users
-- GRANT EXECUTE ON FUNCTION public.duplicate_board(UUID, UUID) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.duplicate_board(UUID) TO authenticated;
