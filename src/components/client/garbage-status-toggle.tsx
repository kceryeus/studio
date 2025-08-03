"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GarbageStatus } from '@/lib/types';

export default function GarbageStatusToggle({ initialStatus }: { initialStatus: GarbageStatus }) {
  const [hasGarbage, setHasGarbage] = useState(initialStatus === 'out');
  const { toast } = useToast();

  const handleToggle = () => {
    const newStatus = !hasGarbage;
    setHasGarbage(newStatus);
    toast({
      title: "Status Updated",
      description: `We've been notified that you ${newStatus ? 'have' : 'do not have'} garbage for collection.`,
    });
  };

  return (
    <Card className="flex flex-col items-center justify-center text-center p-6 h-full">
      <CardHeader className="p-0">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${hasGarbage ? 'bg-primary/10' : 'bg-muted'}`}>
          {hasGarbage ? <Trash2 className="h-8 w-8 text-primary" /> : <BellOff className="h-8 w-8 text-muted-foreground" />}
        </div>
        <CardTitle>Garbage for Collection?</CardTitle>
        <CardDescription className="pt-2">Let us know if you have garbage ready for the next scheduled pickup.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-6 w-full">
        <Button onClick={handleToggle} className="w-full" variant={hasGarbage ? 'default' : 'secondary'}>
          {hasGarbage ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
          {hasGarbage ? 'Yes, I have garbage out' : 'No garbage this time'}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">Toggling this helps us optimize routes and save fuel. Thank you!</p>
      </CardContent>
    </Card>
  );
}
