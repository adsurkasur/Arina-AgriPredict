import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export function NoAlertsState() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
          <p className="text-muted-foreground">
            Your forecast looks good! No critical issues detected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
