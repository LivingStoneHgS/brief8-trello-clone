import { createContext, useContext, useState, ReactNode } from 'react';
import { Board, List, Card, AppState } from '@/types.ts';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  state: AppState;
  createBoard: (name: string, userId: string) => Board;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  duplicateBoard: (boardId: string, userId: string) => Board;
  createList: (name: string, boardId: string) => List;
  updateList: (listId: string, updates: Partial<List>) => void;
  deleteList: (listId: string) => void;
  reorderLists: (boardId: string, sourceIndex: number, destinationIndex: number) => void;
  createCard: (title: string, listId: string) => Card;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, sourceListId: string, destListId: string, newPosition: number) => void;
  getBoardData: (boardId: string) => { board: Board | undefined; lists: List[]; cards: Card[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>({
    boards: [],
    lists: [],
    cards: [],
  });

  const createBoard = (name: string, userId: string): Board => {
    const board: Board = {
      id: uuidv4(),
      name,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setState(prev => ({
      ...prev,
      boards: [...prev.boards, board],
    }));

    // Create default lists for new board
    const defaultLists = ['To Do', 'In Progress', 'Done'];
    defaultLists.forEach((listName, index) => {
      const list: List = {
        id: uuidv4(),
        name: listName,
        board_id: board.id,
        position: index,
        created_at: new Date(),
        updated_at: new Date(),
      };
      setState(prev => ({
        ...prev,
        lists: [...prev.lists, list],
      }));
    });

    return board;
  };

  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    setState(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? { ...board, ...updates, updated_at: new Date() }
          : board
      ),
    }));
  };

  const deleteBoard = (boardId: string) => {
    setState(prev => ({
      ...prev,
      boards: prev.boards.filter(board => board.id !== boardId),
      lists: prev.lists.filter(list => list.board_id !== boardId),
      cards: prev.cards.filter(card => {
        const listExists = prev.lists.some(list => 
          list.id === card.list_id && list.board_id === boardId
        );
        return !listExists;
      }),
    }));
  };

  const duplicateBoard = (boardId: string, userId: string): Board => {
    const originalBoard = state.boards.find(b => b.id === boardId);
    if (!originalBoard) throw new Error('Board not found');

    const newBoard: Board = {
      ...originalBoard,
      id: uuidv4(),
      name: `${originalBoard.name} (Copy)`,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setState(prev => ({
      ...prev,
      boards: [...prev.boards, newBoard],
    }));

    // Duplicate lists and cards
    const boardLists = state.lists.filter(l => l.board_id === boardId);
    boardLists.forEach(list => {
      const newList: List = {
        ...list,
        id: uuidv4(),
        board_id: newBoard.id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      setState(prev => ({
        ...prev,
        lists: [...prev.lists, newList],
      }));

      const listCards = state.cards.filter(c => c.list_id === list.id);
      listCards.forEach(card => {
        const newCard: Card = {
          ...card,
          id: uuidv4(),
          list_id: newList.id,
          created_at: new Date(),
          updated_at: new Date(),
        };

        setState(prev => ({
          ...prev,
          cards: [...prev.cards, newCard],
        }));
      });
    });

    return newBoard;
  };

  const createList = (name: string, boardId: string): List => {
    const boardLists = state.lists.filter(l => l.board_id === boardId);
    const maxPosition = Math.max(...boardLists.map(l => l.position), -1);

    const list: List = {
      id: uuidv4(),
      name,
      board_id: boardId,
      position: maxPosition + 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setState(prev => ({
      ...prev,
      lists: [...prev.lists, list],
    }));

    return list;
  };

  const updateList = (listId: string, updates: Partial<List>) => {
    setState(prev => ({
      ...prev,
      lists: prev.lists.map(list =>
        list.id === listId
          ? { ...list, ...updates, updated_at: new Date() }
          : list
      ),
    }));
  };

  const deleteList = (listId: string) => {
    setState(prev => ({
      ...prev,
      lists: prev.lists.filter(list => list.id !== listId),
      cards: prev.cards.filter(card => card.list_id !== listId),
    }));
  };

  const reorderLists = (boardId: string, sourceIndex: number, destinationIndex: number) => {
    const boardLists = state.lists
      .filter(l => l.board_id === boardId)
      .sort((a, b) => a.position - b.position);

    const [removed] = boardLists.splice(sourceIndex, 1);
    boardLists.splice(destinationIndex, 0, removed);

    setState(prev => ({
      ...prev,
      lists: prev.lists.map(list => {
        if (list.board_id === boardId) {
          const newPosition = boardLists.findIndex(l => l.id === list.id);
          return { ...list, position: newPosition, updated_at: new Date() };
        }
        return list;
      }),
    }));
  };

  const createCard = (title: string, listId: string): Card => {
    const listCards = state.cards.filter(c => c.list_id === listId);
    const maxPosition = Math.max(...listCards.map(c => c.position), -1);

    const card: Card = {
      id: uuidv4(),
      title,
      description: '',
      list_id: listId,
      position: maxPosition + 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setState(prev => ({
      ...prev,
      cards: [...prev.cards, card],
    }));

    return card;
  };

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(card =>
        card.id === cardId
          ? { ...card, ...updates, updated_at: new Date() }
          : card
      ),
    }));
  };

  const deleteCard = (cardId: string) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== cardId),
    }));
  };

  const moveCard = (cardId: string, sourceListId: string, destListId: string, newPosition: number) => {
    setState(prev => {
      const card = prev.cards.find(c => c.id === cardId);
      if (!card) return prev;

      // Remove card from source position
      const otherCards = prev.cards.filter(c => c.id !== cardId);
      
      // Update positions in destination list
      const destCards = otherCards.filter(c => c.list_id === destListId);
      destCards.splice(newPosition, 0, { ...card, list_id: destListId });

      return {
        ...prev,
        cards: [
          ...otherCards.filter(c => c.list_id !== destListId),
          ...destCards.map((c, index) => ({
            ...c,
            position: index,
            updated_at: new Date(),
          })),
        ],
      };
    });
  };

  const getBoardData = (boardId: string) => {
    const board = state.boards.find(b => b.id === boardId);
    const lists = state.lists
      .filter(l => l.board_id === boardId)
      .sort((a, b) => a.position - b.position);
    const cards = state.cards.filter(c =>
      lists.some(l => l.id === c.list_id)
    ).sort((a, b) => a.position - b.position);

    return { board, lists, cards };
  };

  return (
    <AppContext.Provider
      value={{
        state,
        createBoard,
        updateBoard,
        deleteBoard,
        duplicateBoard,
        createList,
        updateList,
        deleteList,
        reorderLists,
        createCard,
        updateCard,
        deleteCard,
        moveCard,
        getBoardData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};