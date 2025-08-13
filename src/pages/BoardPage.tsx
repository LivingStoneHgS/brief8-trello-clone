import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import { KanbanList } from '@/components/KanbanList';
import { List, GetBoardResponse } from '@/types.ts';
import { BoardService } from '@/services/BoardService';
import { log } from 'console';

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { createList, reorderLists, moveCard } = useApp();
  const { auth } = useAuth();
  const { toast } = useToast();
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [boardData, setBoardData] = useState<GetBoardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!boardId) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    const loadBoard = async () => {
      try {
        setIsLoading(true);
        const response = await BoardService.getBoard({ uuid: boardId });
        setBoardData(response);
      } catch (error) {
        toast({
          title: "Board not found",
          description: "The board you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadBoard();
  }, [boardId, navigate, toast]);

  const handleCreateList = () => {
    if (!newListName.trim()) return;

    createList(newListName.trim(), boardId);
    setNewListName('');
    setIsAddingList(false);
    toast({
      title: "List created",
      description: `"${newListName}" has been added to the board.`,
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'list') {
      reorderLists(boardId, source.index, destination.index);
      return;
    }

    if (type === 'card') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;
      const cardId = result.draggableId;

      moveCard(cardId, sourceListId, destListId, destination.index);
    }
  };

  const getListCards = (listId: string) => {
    if (!boardData) return [];
    const list = boardData.board.lists.find(l => l.id === listId);
    return list ? list.cards.sort((a, b) => a.position - b.position) : [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-board">
        {/* Header Skeleton */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-6 w-px bg-border" />
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="container-fluid px-6 py-6 overflow-x-auto">
          <div className="flex space-x-6 min-h-[calc(100vh-200px)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <div className="bg-list-bg rounded-xl p-4 border border-border">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    <div className="h-20 bg-muted rounded animate-pulse" />
                    <div className="h-20 bg-muted rounded animate-pulse" />
                    <div className="h-20 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-board">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-card-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Boards
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold text-card-foreground">{boardData.board.name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Board Content */}
      <main className="container-fluid px-6 py-6 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex space-x-6 min-h-[calc(100vh-200px)]"
              >
                {boardData.board.lists.map((list: any, index: number) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex-shrink-0 ${snapshot.isDragging ? 'rotate-3' : ''}`}
                      >
                        <KanbanList
                          list={list}
                          cards={getListCards(list.id)}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add List Column */}
                <div className="flex-shrink-0 w-80">
                  {isAddingList ? (
                    <div className="bg-list-bg rounded-xl p-4 border border-border">
                      <Input
                        placeholder="Enter list name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateList();
                          if (e.key === 'Escape') {
                            setIsAddingList(false);
                            setNewListName('');
                          }
                        }}
                        className="mb-3 bg-card border-border text-card-foreground"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleCreateList}
                          disabled={!newListName.trim()}
                          size="sm"
                          className="bg-gradient-primary hover:opacity-90 text-white"
                        >
                          Add List
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingList(false);
                            setNewListName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsAddingList(true)}
                      variant="ghost"
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary border-dashed border-2 border-border hover:border-primary transition-colors text-muted-foreground hover:text-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a list
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>
    </div>
  );
};

export default BoardPage;