
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GarbageStatus } from '@/lib/types';
import { useLanguage } from '@/context/language-context';

export default function GarbageStatusToggle({ initialStatus }: { initialStatus: GarbageStatus }) {
  const [hasGarbage, setHasGarbage] = useState(initialStatus === 'out');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleToggle = () => {
    const newStatus = !hasGarbage;
    setHasGarbage(newStatus);
    toast({
      title: t('status_updated'),
      description: newStatus ? t('garbage_status_yes_toast') : t('garbage_status_no_toast'),
    });
  };

  return (
    <Card className="flex flex-col items-center justify-center text-center p-6 h-full">
      <CardHeader className="p-0">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${hasGarbage ? 'bg-primary/10' : 'bg-muted'}`}>
          {hasGarbage ? <Trash2 className="h-8 w-8 text-primary" /> : <BellOff className="h-8 w-8 text-muted-foreground" />}
        </div>
        <CardTitle>{t('garbage_for_collection_title')}</CardTitle>
        <CardDescription className="pt-2">{t('garbage_for_collection_subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-6 w-full">
        <Button onClick={handleToggle} className="w-full" variant={hasGarbage ? 'default' : 'secondary'}>
          {hasGarbage ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
          {hasGarbage ? t('garbage_status_yes') : t('garbage_status_no')}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">{t('garbage_status_footer')}</p>
      </CardContent>
    </Card>
  );
}
