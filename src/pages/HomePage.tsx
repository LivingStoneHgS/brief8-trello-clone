import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { BoardService } from '@/services/BoardService';
import { Board } from '@/types.ts';
import { Plus, MoreHorizontal, User, LogOut, Copy, Trash2, Edit3 } from 'lucide-react';

const HomePage = () => {
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { auth, logout } = useAuth();
  const { updateBoard, deleteBoard, duplicateBoard } = useApp();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const userBoards = boards.filter(board => board.user_id === auth.user?.id);

  useEffect(() => {
    const loadUserBoards = async () => {
      if (!auth.user) return;
      
      try {
        setIsLoading(true);
        const response = await BoardService.listUserBoards({});
        setBoards(response.boards);
      } catch (error) {
        toast({
          title: "Error loading boards",
          description: error instanceof Error ? error.message : "Failed to load your boards",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserBoards();
  }, [auth.user, toast]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !auth.user) return;

    try {
      const { board } = await BoardService.createBoard({ name: newBoardName.trim() });
      
      // Add the new board to local state
      setBoards(prevBoards => [...prevBoards, board]);
      
      setNewBoardName('');
      setIsCreateDialogOpen(false);
      toast({
        title: "Board created!",
        description: `"${board.name}" has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error creating board",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRenameBoard = (boardId: string, currentName: string) => {
    setEditingBoard(boardId);
    setEditName(currentName);
  };

  const saveRename = () => {
    if (!editName.trim() || !editingBoard) return;

    updateBoard(editingBoard, { name: editName.trim() });
    setEditingBoard(null);
    setEditName('');
    toast({
      title: "Board renamed",
      description: "Board name has been updated successfully.",
    });
  };

  const handleDeleteBoard = async (boardId: string, boardName: string) => {
    try {
      await BoardService.deleteBoard(boardId);
      setBoards(prevBoards => prevBoards.filter(b => b.id !== boardId));
      toast({
        title: "Board deleted",
        description: `"${boardName}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error deleting board",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateBoard = async (boardId: string) => {
    if (!auth.user) return;
    try {
      const newBoard = await duplicateBoard(boardId, auth.user.id);
      setBoards(prevBoards => [...prevBoards, newBoard]);
      toast({
        title: "Board duplicated",
        description: `"${newBoard.name}" has been created as a copy.`,
      });
    } catch (error) {
      toast({
        title: "Error duplicating board",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-board">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <div className="h-6 w-6 bg-white rounded-sm" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Trello</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{auth.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-card-foreground mb-2">
              Your Boards
            </h2>
            <p className="text-muted-foreground">
              {userBoards.length === 0 
                ? "Create your first board to get started"
                : `${userBoards.length} board${userBoards.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Board
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Create New Board</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Choose a name for your new board. You can always change it later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter board name..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                  className="bg-secondary border-border text-secondary-foreground"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateBoard}
                    disabled={!newBoardName.trim()}
                    className="bg-gradient-primary hover:opacity-90 text-white"
                  >
                    Create Board
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            <>
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="bg-gradient-card border-border">
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-4"></div>
                    <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                  </CardContent>
                </Card>
              ))}
              <Card className="bg-secondary/50 border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="h-12 w-12 bg-muted rounded-full animate-pulse mb-4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {userBoards.map((board) => (
                <Card
                  key={board.id}
                  className="bg-gradient-card border-border card-shadow hover:card-elevated transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      {editingBoard === board.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={saveRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename();
                            if (e.key === 'Escape') {
                              setEditingBoard(null);
                              setEditName('');
                            }
                          }}
                          className="text-lg font-semibold bg-transparent border-primary"
                          autoFocus
                        />
                      ) : (
                        <CardTitle
                          className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() => navigate(`/board/${board.id}`)}
                        >
                          {board.name}
                        </CardTitle>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRenameBoard(board.id, board.name)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateBoard(board.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteBoard(board.id, board.name)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-muted-foreground text-sm">
                      Created {board.created_at.toLocaleDateString()}
                    </CardDescription>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 justify-start text-card-foreground hover:text-primary"
                      onClick={() => navigate(`/board/${board.id}`)}
                    >
                      Open Board →
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Create Board Card */}
              <Card
                className="bg-secondary/50 border-dashed border-2 border-border hover:border-primary transition-colors cursor-pointer group"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                  <p className="text-muted-foreground group-hover:text-primary transition-colors font-medium">
                    Create new board
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;