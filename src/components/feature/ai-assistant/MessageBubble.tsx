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
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      role="listitem"
      aria-label={isUser ? "User message" : "Assistant message"}
      tabIndex={0}
      style={{
        // Performance: Hardware acceleration for message bubbles
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        contain: 'layout style paint'
      }}
    >
      <div className={cn("flex max-w-2xl w-full space-x-3", isUser ? "flex-row-reverse space-x-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )} aria-hidden="true" style={{
          // Performance: Optimize avatar rendering
          willChange: 'background-color',
          contain: 'layout style'
        }}>
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
              "p-4 rounded-lg transition-smooth",
              isUser
                ? "ai-message-user text-primary-foreground"
                : "ai-message-assistant"
            )}
            aria-live={isUser ? undefined : "polite"}
            aria-atomic="true"
            style={{
              // Performance: Optimize message content
              willChange: 'background-color, color',
              contain: 'layout style'
            }}
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
            "text-xs text-muted-foreground mt-2",
            isUser ? "text-right" : "text-left"
          )} aria-label={`Sent at ${timestamp}`} style={{
            // Performance: Optimize timestamp rendering
            willChange: 'color',
            contain: 'layout style'
          }}>
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}