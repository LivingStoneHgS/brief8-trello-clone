-- Update the create_board function to include template lists and cards
CREATE OR REPLACE FUNCTION public.create_board(board_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    new_board public.boards%ROWTYPE;
    todo_list public.lists%ROWTYPE;
    in_progress_list public.lists%ROWTYPE;
    done_list public.lists%ROWTYPE;
BEGIN
    -- Create the new board
    INSERT INTO public.boards (name, user_id)
    VALUES (board_name, auth.uid())
    RETURNING * INTO new_board;
    
    -- Create template lists
    INSERT INTO public.lists (name, board_id, position)
    VALUES ('To Do', new_board.id, 0)
    RETURNING * INTO todo_list;
    
    INSERT INTO public.lists (name, board_id, position)
    VALUES ('In Progress', new_board.id, 1)
    RETURNING * INTO in_progress_list;
    
    INSERT INTO public.lists (name, board_id, position)
    VALUES ('Done', new_board.id, 2)
    RETURNING * INTO done_list;
    
    -- Create template cards
    INSERT INTO public.cards (title, description, list_id, position) VALUES
    ('Welcome to your new board!', 'This is a sample card to get you started. Click to edit or delete it.', todo_list.id, 0),
    ('Set up your first task', 'Add your tasks here and move them through the workflow.', todo_list.id, 1),
    ('Start working on a task', 'Drag cards to "In Progress" when you begin working on them.', in_progress_list.id, 0),
    ('Complete your first task', 'Move cards here when they are finished!', done_list.id, 0);
    
    -- Return the board data in the same format as the original function
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

-- Grant execute permission to authenticated users (maintain existing permissions)
GRANT EXECUTE ON FUNCTION public.create_board(TEXT) TO authenticated;