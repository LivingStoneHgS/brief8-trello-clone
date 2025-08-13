-- Create create_card function
CREATE OR REPLACE FUNCTION create_card(
  p_title TEXT,
  p_list_id UUID,
  p_position INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_card RECORD;
  result JSON;
BEGIN
  -- Insert new card
  INSERT INTO cards (title, description, list_id, position)
  VALUES (p_title, COALESCE(p_description, ''), p_list_id, p_position)
  RETURNING *
  INTO new_card;
  
  -- Return the newly created card wrapped in a 'card' field
  result := json_build_object(
    'card', json_build_object(
      'id', new_card.id,
      'title', new_card.title,
      'description', new_card.description,
      'list_id', new_card.list_id,
      'position', new_card.position,
      'created_at', new_card.created_at,
      'updated_at', new_card.updated_at
    )
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_card(TEXT, UUID, INTEGER, TEXT) TO authenticated;