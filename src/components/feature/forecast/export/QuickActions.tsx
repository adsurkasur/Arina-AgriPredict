import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Mail, FileText } from 'lucide-react';
import { toast } from '@/lib/toast';
import { QuickActionsProps } from './types';

export const QuickActions: React.FC<QuickActionsProps> = ({
  onShare,
  onEmail
}) => {
  const handlePrint = () => {
    toast.info('Print functionality would open print dialog');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" onClick={onShare} className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </Button>

          <Button variant="outline" onClick={onEmail} className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
