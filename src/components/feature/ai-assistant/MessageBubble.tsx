import { format, parseISO } from 'date-fns';
import { User, Bot } from 'lucide-react';
import { Message } from '@/types/api';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timestamp = format(parseISO(message.timestamp), 'HH:mm');

  return (
    <div
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
      role="listitem"
      aria-label={isUser ? "User message" : "Assistant message"}
      tabIndex={0}
    >
      <div className={cn("flex max-w-[80%] space-x-2", isUser ? "flex-row-reverse space-x-reverse" : "flex-row")}> 
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )} aria-hidden="true">
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "p-3 rounded-lg transition-smooth",
              isUser 
                ? "ai-message-user text-primary-foreground" 
                : "ai-message-assistant"
            )}
            aria-live={isUser ? undefined : "polite"}
            aria-atomic="true"
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <MarkdownRenderer 
                content={message.content}
                className="text-sm"
              />
            )}
          </div>
          {/* Timestamp */}
          <p className={cn(
            "text-xs text-muted-foreground mt-1",
            isUser ? "text-right" : "text-left"
          )} aria-label={`Sent at ${timestamp}`}>
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}