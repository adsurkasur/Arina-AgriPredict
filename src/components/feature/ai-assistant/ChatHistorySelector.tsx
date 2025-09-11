import React, { useState } from 'react';
import { format } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/zustand-store';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GenericDeleteConfirmationDialog } from '@/components/common/GenericDeleteConfirmationDialog';
import {
  MessageSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface ChatHistorySelectorProps {
  isCollapsed?: boolean;
}

export function ChatHistorySelector({ isCollapsed }: ChatHistorySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const pathname = usePathname();
  const { navigateTo } = useNavigation();
  const {
    chatSessions,
    currentChatId,
    loadChat,
    createNewChat,
    deleteChat,
    renameChat
  } = useAppStore();

  const handleSelectChat = (chatId: string) => {
    loadChat(chatId);
    
    // Redirect to /assistant if not already there
    if (pathname !== '/assistant') {
      navigateTo('/assistant');
    } else {
      toast.success("Chat loaded", {
        description: `Switched to "${chatSessions[chatId].name}"`
      });
    }
  };

  const handleCreateNewChat = () => {
    createNewChat();
    
    // Redirect to /assistant if not already there
    if (pathname !== '/assistant') {
      navigateTo('/assistant');
    } else {
      toast.success("New chat created", {
        description: "Started a new conversation"
      });
    }
  };

  const handleDeleteChat = async (chatId: string, chatName: string) => {
    deleteChat(chatId);
    toast.success("Chat deleted", {
      description: `"${chatName}" has been deleted`
    });
  };

  const handleRenameChat = (chatId: string, currentName: string) => {
    setRenameChatId(chatId);
    setRenameInput(currentName);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = () => {
    const trimmedName = renameInput.trim();
    if (trimmedName && renameChatId && trimmedName !== chatSessions[renameChatId]?.name) {
      renameChat(renameChatId, trimmedName);
      toast.success("Chat renamed", {
        description: `Chat renamed to "${trimmedName}"`
      });
    }
    setRenameModalOpen(false);
    setRenameChatId(null);
    setRenameInput('');
  };

  const sortedChatSessions = Object.entries(chatSessions)
    .sort(([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Chat History Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-muted/50 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Chat History</span>
          <Badge variant="secondary" className="text-xs">
            {Object.keys(chatSessions).length}
          </Badge>
        </div>
      </button>

      {/* Chat List */}
      {isExpanded && (
        <div className="space-y-1">
          {/* New Chat Button */}
          <Button
            onClick={handleCreateNewChat}
            variant="ghost"
            size="sm"
            className="w-full justify-start px-3 py-2 h-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">New Chat</span>
          </Button>

          <Separator className="my-2" />

          {/* Chat Sessions */}
          {sortedChatSessions.length === 0 ? (
            <div className="px-3 py-4 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No chats yet</p>
            </div>
          ) : (
            <ScrollArea className="h-80 w-full rounded-md border-0">
              <div className="space-y-1 p-1">
                {sortedChatSessions.map(([chatId, session]) => (
                  <div
                    key={chatId}
                    className={`group relative flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      currentChatId === chatId
                        ? 'bg-primary/10 border border-primary/20'
                        : ''
                    }`}
                    onClick={() => handleSelectChat(chatId)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {session.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{format(new Date(session.createdAt), 'dd/MM/yyyy')}</span>
                            <span>•</span>
                            <span>{session.messages.length} msg</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons - show on hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChat(chatId, session.name);
                        }}
                        title="Rename chat"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <GenericDeleteConfirmationDialog
                        title="Delete Chat Session"
                        description="Are you sure you want to delete this chat session? This action cannot be undone and all messages in this conversation will be permanently removed."
                        itemName={session.name}
                        itemDetails={[
                          `Created: ${format(new Date(session.createdAt), 'dd/MM/yyyy')}`,
                          `Messages: ${session.messages.length}`
                        ]}
                        onConfirm={() => handleDeleteChat(chatId, session.name)}
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-white hover:scale-110 transition-all duration-200 hover:shadow-sm"
                            title="Delete chat"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Rename Chat Modal */}
      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chat-name" className="text-right">
                Name
              </Label>
              <Input
                id="chat-name"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className="col-span-3"
                placeholder="Enter chat name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameSubmit();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRenameModalOpen(false);
                setRenameChatId(null);
                setRenameInput('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={!renameInput.trim()}
            >
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
