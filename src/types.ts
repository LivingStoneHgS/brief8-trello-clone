// Backend-ready data types
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

export type Board = {
  id: string;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export type List = {
  id: string;
  name: string;
  board_id: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export type Card = {
  id: string;
  title: string;
  description: string;
  list_id: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

// UI State types
export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
}

export type AppState = {
  boards: Board[];
  lists: List[];
  cards: Card[];
}

// Endpoints Request/Response types
export type CreateBoardRequest = { name: string; }
export type CreateBoardResponse = {
  board: {
    id: string;
    name: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
  }
 }

export type ListUserBoardsRequest = {}
export type ListUserBoardsResponse = {
  boards: Array<{
      id: string;
      name: string;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>;
}