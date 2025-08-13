import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/types.ts';
import { MoreHorizontal, Edit3, Trash2, Calendar } from 'lucide-react';

interface KanbanCardProps {
  card: Card;
}

export const KanbanCard = ({ card }: KanbanCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { updateCard, deleteCard } = useApp();
  const { toast } = useToast();

  const handleUpdateCard = () => {
    if (!editTitle.trim()) return;

    updateCard(card.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
    setIsEditing(false);
    setIsDetailOpen(false);
    toast({
      title: "Card updated",
      description: "Card has been updated successfully.",
    });
  };

  const handleDeleteCard = () => {
    deleteCard(card.id);
    setIsDetailOpen(false);
    toast({
      title: "Card deleted",
      description: `"${card.title}" has been deleted.`,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogTrigger asChild>
        <div className="bg-card hover:bg-card-hover border border-border rounded-lg p-3 cursor-pointer card-shadow hover:card-elevated transition-all duration-200 group">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-3">
              {card.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => setIsDetailOpen(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteCard}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {card.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {card.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(card.updated_at)}
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEditing ? 'Edit Card' : card.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Title
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-secondary border-border text-secondary-foreground"
                  placeholder="Card title..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="bg-secondary border-border text-secondary-foreground min-h-[100px]"
                  placeholder="Add a description..."
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateCard}
                  disabled={!editTitle.trim()}
                  className="bg-gradient-primary hover:opacity-90 text-white"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(card.title);
                    setEditDescription(card.description);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {card.description && (
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Description
                  </label>
                  <div className="bg-secondary rounded-lg p-3 text-secondary-foreground text-sm">
                    {card.description || 'No description'}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Created
                  </label>
                  <div className="text-muted-foreground">
                    {formatDate(card.created_at)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Last Updated
                  </label>
                  <div className="text-muted-foreground">
                    {formatDate(card.updated_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-primary hover:opacity-90 text-white"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Card
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCard}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Card
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};