import { supabase } from '@/lib/supabaseClient';
import { CreateBoardRequest, CreateBoardResponse, ListUserBoardsRequest, ListUserBoardsResponse, GetBoardRequest, GetBoardResponse, CreateCardRequest, CreateCardResponse } from '@/types';

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

  static async getBoard(request: GetBoardRequest): Promise<GetBoardResponse> {
    const { data, error } = await supabase
      .rpc('get_board', { board_uuid: request.uuid });

    if (error) {
      throw new Error(`Failed to get board: ${error.message}`);
    }

    const response: GetBoardResponse = {
      board: {
        id: data.board.id,
        name: data.board.name,
        user_id: data.board.user_id,
        created_at: new Date(data.board.created_at),
        updated_at: new Date(data.board.updated_at),
        lists: data.board.lists.map((list: any) => ({
          id: list.id,
          name: list.name,
          board_id: list.board_id,
          position: list.position,
          created_at: new Date(list.created_at),
          updated_at: new Date(list.updated_at),
          cards: list.cards.map((card: any) => ({
            id: card.id,
            title: card.title,
            description: card.description,
            list_id: card.list_id,
            position: card.position,
            created_at: new Date(card.created_at),
            updated_at: new Date(card.updated_at)
          }))
        }))
      }
    };

    return response;
  }

  static async createCard(request: CreateCardRequest): Promise<CreateCardResponse> {
    const { data, error } = await supabase
      .rpc('create_card', {
        p_title: request.title,
        p_description: request.description || '',
        p_list_id: request.list_id,
        p_position: request.position
      });

    if (error) {
      throw new Error(`Failed to create card: ${error.message}`);
    }

    const response: CreateCardResponse = {
      card: {
        id: data.card.id,
        title: data.card.title,
        description: data.card.description,
        list_id: data.card.list_id,
        position: data.card.position,
        created_at: new Date(data.card.created_at),
        updated_at: new Date(data.card.updated_at)
      }
    };

    return response;
  }
}