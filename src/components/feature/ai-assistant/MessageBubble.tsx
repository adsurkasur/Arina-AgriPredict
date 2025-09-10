import { format, parseISO } from 'date-fns';
import { User } from 'lucide-react';
import Image from 'next/image';
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
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ring-2",
          isUser 
            ? "bg-primary text-primary-foreground ring-primary/20" 
            : "bg-muted text-muted-foreground ring-muted/50"
        )} aria-hidden="true" style={{
          // Performance: Optimize avatar rendering
          willChange: 'background-color',
          contain: 'layout style'
        }}>
          {isUser ? (
            <User className="h-5 w-5" />
          ) : (
            <Image
              src="/logo.svg"
              alt="Arina AgriPredict Bot"
              width={24}
              height={24}
              className="object-contain"
            />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "p-4 rounded-2xl transition-smooth shadow-sm relative",
              isUser
                ? "ai-message-user text-primary-foreground bg-primary rounded-br-md"
                : "ai-message-assistant bg-muted rounded-bl-md"
            )}
            aria-live={isUser ? undefined : "polite"}
            aria-atomic="true"
            style={{
              // Performance: Optimize message content
              willChange: 'background-color, color',
              contain: 'layout style',
              // Add chat bubble effect
              position: 'relative'
            }}
          >
            {/* Chat bubble tail */}
            <div
              className={cn(
                "absolute w-0 h-0 border-l-8 border-r-8 border-t-8",
                isUser
                  ? "right-0 -mr-2 border-l-primary border-r-transparent border-t-primary top-4"
                  : "left-0 -ml-2 border-r-muted border-l-transparent border-t-muted top-4"
              )}
              style={{
                borderBottom: 'none',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
              }}
            />
            
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