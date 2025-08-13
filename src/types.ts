// Backend-ready data types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

export interface Board {
  id: string;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface List {
  id: string;
  name: string;
  board_id: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  list_id: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

// UI State types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppState {
  boards: Board[];
  lists: List[];
  cards: Card[];
}