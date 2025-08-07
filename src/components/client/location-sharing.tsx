
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import type { Client } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function LocationSharing({ initialStatus, client }: { initialStatus: boolean, client: Client }) {
  const [isSharing, setIsSharing] = useState(initialStatus);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleToggle = async (checked: boolean) => {
    setIsSharing(checked);

     try {
        const clientRef = doc(db, "clients", client.id);
        await updateDoc(clientRef, {
            sharesLocation: checked
        });
        toast({
            title: t('location_preference_updated'),
            description: checked ? t('location_sharing_on_toast') : t('location_sharing_off_toast'),
        });
    } catch (error) {
        console.error("Error updating location sharing: ", error);
        setIsSharing(!checked); // Revert UI on error
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update your location preference. Please try again."
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> {t('location_sharing_title')}</CardTitle>
        <CardDescription>{t('location_sharing_subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="location-sharing-toggle" className="flex flex-col space-y-1">
                <span>{t('share_my_location')}</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    {t('share_my_location_subtitle')}
                </span>
            </Label>
            <Switch
                id="location-sharing-toggle"
                checked={isSharing}
                onCheckedChange={handleToggle}
            />
        </div>
      </CardContent>
    </Card>
  );
}
