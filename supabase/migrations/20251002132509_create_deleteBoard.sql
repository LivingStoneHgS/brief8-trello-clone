-- Function: public.delete_board(board_uuid UUID)
-- Deletes a board and all its lists and cards by board id
CREATE OR REPLACE FUNCTION public.delete_board(board_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    -- Delete all cards in lists belonging to the board
    DELETE FROM public.cards
    WHERE list_id IN (
        SELECT id FROM public.lists WHERE board_id = board_uuid
    );

    -- Delete all lists belonging to the board
    DELETE FROM public.lists WHERE board_id = board_uuid;

    -- Delete the board itself
    DELETE FROM public.boards WHERE id = board_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_board(UUID) TO authenticated;
