import { format, parseISO } from 'date-fns';
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
      <div className="max-w-4xl">
        {/* Message Content */}
        {isUser ? (
          // User message with bubble
          <div
            className="p-4 rounded-2xl bg-primary text-primary-foreground shadow-sm transition-smooth"
            style={{
              // Dynamic width based on content
              width: 'auto',
              maxWidth: '32rem',
              minWidth: '4rem'
            }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        ) : (
          // Bot message without bubble - plain text
          <div className="text-muted-foreground">
            <MarkdownRenderer
              content={message.content}
              className="text-sm leading-relaxed"
            />
          </div>
        )}

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
  );
}