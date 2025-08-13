import { useState } from 'react';
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { List, Card } from '@/types.ts';
import { Plus, MoreHorizontal, GripVertical, Edit3, Trash2 } from 'lucide-react';
import { KanbanCard } from './KanbanCard';

interface KanbanListProps {
  list: List;
  cards: Card[];
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const KanbanList = ({ list, cards, dragHandleProps }: KanbanListProps) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingList, setIsEditingList] = useState(false);
  const [editListName, setEditListName] = useState(list.name);
  const { createCard, updateList, deleteList } = useApp();
  const { toast } = useToast();

  const handleCreateCard = () => {
    if (!newCardTitle.trim()) return;

    createCard(newCardTitle.trim(), list.id);
    setNewCardTitle('');
    setIsAddingCard(false);
    toast({
      title: "Card created",
      description: `"${newCardTitle}" has been added to ${list.name}.`,
    });
  };

  const handleUpdateList = () => {
    if (!editListName.trim()) return;

    updateList(list.id, { name: editListName.trim() });
    setIsEditingList(false);
    toast({
      title: "List renamed",
      description: `List has been renamed to "${editListName}".`,
    });
  };

  const handleDeleteList = () => {
    deleteList(list.id);
    toast({
      title: "List deleted",
      description: `"${list.name}" and all its cards have been deleted.`,
    });
  };

  return (
    <div className="w-80 bg-list-bg rounded-xl border border-border card-shadow">
      {/* List Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <div {...dragHandleProps} className="drag-handle">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            {isEditingList ? (
              <Input
                value={editListName}
                onChange={(e) => setEditListName(e.target.value)}
                onBlur={handleUpdateList}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateList();
                  if (e.key === 'Escape') {
                    setIsEditingList(false);
                    setEditListName(list.name);
                  }
                }}
                className="font-semibold bg-transparent border-primary text-card-foreground"
                autoFocus
              />
            ) : (
              <h3
                className="font-semibold text-card-foreground cursor-pointer flex-1"
                onClick={() => setIsEditingList(true)}
              >
                {list.name}
              </h3>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-card-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditingList(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteList}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {cards.length} card{cards.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Cards */}
      <Droppable droppableId={list.id} type="card">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] p-4 space-y-3 ${
              snapshot.isDraggingOver ? 'bg-accent/20' : ''
            } transition-colors`}
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? 'rotate-3' : ''}
                  >
                    <KanbanCard card={card} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Add Card */}
            {isAddingCard ? (
              <div className="space-y-3">
                <Input
                  placeholder="Enter card title..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCard();
                    if (e.key === 'Escape') {
                      setIsAddingCard(false);
                      setNewCardTitle('');
                    }
                  }}
                  className="bg-card border-border text-card-foreground"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateCard}
                    disabled={!newCardTitle.trim()}
                    size="sm"
                    className="bg-gradient-primary hover:opacity-90 text-white"
                  >
                    Add Card
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingCard(false);
                      setNewCardTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAddingCard(true)}
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-card-foreground hover:bg-card-hover"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add a card
              </Button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};