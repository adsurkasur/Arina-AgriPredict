import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Wifi, WifiOff } from 'lucide-react';

interface StreamControlsProps {
  isStreaming: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  onToggle: () => void;
}

const getStatusColor = (status: 'connected' | 'disconnected' | 'connecting') => {
  switch (status) {
    case 'connected':
      return 'bg-green-500';
    case 'connecting':
      return 'bg-yellow-500';
    case 'disconnected':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: 'connected' | 'disconnected' | 'connecting') => {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting...';
    case 'disconnected':
      return 'Disconnected';
    default:
      return 'Unknown';
  }
};

export const StreamControls: React.FC<StreamControlsProps> = ({
  isStreaming,
  connectionStatus,
  onToggle
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Stream Controls</span>
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant="secondary" className={getStatusColor(connectionStatus)}>
              {getStatusText(connectionStatus)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onToggle}
          variant={isStreaming ? 'destructive' : 'default'}
          size="sm"
          className="flex items-center gap-2"
        >
          {isStreaming ? (
            <>
              <Square className="h-4 w-4" />
              Stop Stream
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Stream
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
