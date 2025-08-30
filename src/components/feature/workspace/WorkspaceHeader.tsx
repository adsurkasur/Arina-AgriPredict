import { Leaf, BarChart3, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WorkspaceHeader() {
  return (
    <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AgriPredict</h1>
            <p className="text-sm text-muted-foreground">
              Agricultural demand forecasting and data analysis platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Real-time Analytics</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>AI Assistant</span>
          </div>
          <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
            Online
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}