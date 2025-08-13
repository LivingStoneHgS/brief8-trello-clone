-- Create the create_board function
CREATE OR REPLACE FUNCTION public.create_board(board_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_board public.boards%ROWTYPE;
BEGIN
    INSERT INTO public.boards (name, user_id)
    VALUES (board_name, auth.uid())
    RETURNING * INTO new_board;
    
    RETURN jsonb_build_object(
        'board', jsonb_build_object(
            'id', new_board.id,
            'name', new_board.name,
            'user_id', new_board.user_id,
            'created_at', new_board.created_at,
            'updated_at', new_board.updated_at
        )
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_board(TEXT) TO authenticated;