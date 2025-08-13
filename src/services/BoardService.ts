import { supabase } from '@/lib/supabaseClient';
import { CreateBoardRequest, CreateBoardResponse, ListUserBoardsRequest, ListUserBoardsResponse, Board } from '@/types';

export class BoardService {
  static async createBoard(request: CreateBoardRequest): Promise<CreateBoardResponse> {
    const { data, error } = await supabase
      .rpc('create_board', { board_name: request.name });

    if (error) {
      throw new Error(`Failed to create board: ${error.message}`);
    }

    const response: CreateBoardResponse = {
      board: {
        id: data.board.id,
        name: data.board.name,
        user_id: data.board.user_id,
        created_at: new Date(data.board.created_at),
        updated_at: new Date(data.board.updated_at)
      }
    };

    return response;
  }

  static async listUserBoards(request: ListUserBoardsRequest): Promise<ListUserBoardsResponse> {
    const { data, error } = await supabase
      .rpc('list_user_boards');

    if (error) {
      throw new Error(`Failed to list user boards: ${error.message}`);
    }

    const response: ListUserBoardsResponse = {
      boards: data.boards.map((board: any) => ({
        id: board.id,
        name: board.name,
        user_id: board.user_id,
        created_at: new Date(board.created_at),
        updated_at: new Date(board.updated_at)
      }))
    };

    return response;
  }
}