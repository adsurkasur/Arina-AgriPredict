import { useRef } from 'react';
import { useChat } from '@/hooks/useApiHooks';
import { useAppStore } from '@/store/zustand-store';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Message } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { SuggestionChips } from './SuggestionChips';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Send } from 'lucide-react';
import Image from 'next/image';

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
  }
  return 'An unexpected error occurred. Please try again.';
};

export function AIAssistantPanel() {
  const [inputMessage, setInputMessage] = useLocalStorage('ai-assistant-input', '');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { 
    chatMessages, 
    isAiTyping, 
    addChatMessage, 
    setAiTyping
  } = useAppStore();
  
  const chatMutation = useChat();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message optimistically
    addChatMessage(userMessage);
    setInputMessage('');
    setAiTyping(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: userMessage.content,
        history: chatMessages,
      });

      const aiMessage: Message = {
        id: response.response.id,
        role: 'assistant',
        content: response.response.content,
        timestamp: new Date().toISOString(),
        suggestions: response.response.suggestions,
      };

      addChatMessage(aiMessage);
    } catch (error: any) {
      // Display error message in chat
      const errorContent = getErrorMessage(error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error:** ${errorContent}\n\nPlease try again or rephrase your question.`,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMessage);
      console.error('Chat error:', error);
    } finally {
      setAiTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const latestSuggestions = chatMessages
    .filter(msg => msg.role === 'assistant' && msg.suggestions?.length)
    .slice(-1)[0]?.suggestions || [];

  return (
    <div className="flex flex-col h-full bg-background" aria-label="AI Assistant Panel" role="region" style={{
      // Performance: Hardware acceleration for main panel
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      contain: 'layout style paint'
    }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <ErrorBoundary>
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" role="log" aria-live="polite" aria-label="Chat messages" style={{
            // Performance: Optimize scroll area
            contain: 'layout style'
          }}>
            <div className="max-w-4xl mx-auto space-y-6 h-full">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center text-muted-foreground" aria-label="AI Assistant Ready" style={{
                  // Performance: Optimize welcome screen
                  willChange: 'color',
                  contain: 'layout style'
                }}>
                  <Image
                    src="/logo.svg"
                    alt="Arina AgriPredict AI Assistant"
                    width={64}
                    height={64}
                    className="mx-auto mb-6 opacity-50"
                    aria-hidden="true"
                  />
                  <h2 className="text-2xl font-semibold mb-2">AI Assistant Ready</h2>
                  <p className="text-base max-w-md">
                    Ask me to analyze data, create records, or generate forecasts
                  </p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              {/* Typing Indicator */}
              {isAiTyping && (
                <div className="ai-message-assistant max-w-xs p-3 rounded-lg" aria-label="AI is thinking" style={{
                  // Performance: Optimize typing indicator
                  willChange: 'opacity',
                  contain: 'layout style'
                }}>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150" />
                    </div>
                    <span className="text-xs text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={scrollAreaRef} />
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {latestSuggestions.length > 0 && (
            <div className="px-4 pb-2">
              <div className="max-w-4xl mx-auto">
                <SuggestionChips
                  suggestions={latestSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  aria-label="AI suggestions"
                />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm" style={{
            // Performance: Optimize input area
            willChange: 'background-color, border-color',
            contain: 'layout style'
          }}>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-3">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to analyze data, create records, or generate forecasts..."
                  className="min-h-[80px] resize-none transition-smooth"
                  disabled={chatMutation.isPending}
                  aria-label="Chat input"
                  style={{
                    // Performance: Optimize textarea
                    willChange: 'background-color, color, border-color',
                    contain: 'layout style'
                  }}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || chatMutation.isPending}
                      size="sm"
                      className="transition-smooth"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}