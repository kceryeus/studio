
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

export default function LocationSharing({ initialStatus }: { initialStatus: boolean }) {
  const [isSharing, setIsSharing] = useState(initialStatus);
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    setIsSharing(checked);
    toast({
      title: "Location Preference Updated",
      description: `You are now ${checked ? 'sharing' : 'not sharing'} your location with the provider.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Location Sharing</CardTitle>
        <CardDescription>Allow your provider to see your location for optimized routing.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="location-sharing-toggle" className="flex flex-col space-y-1">
                <span>Share My Location</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Help us create efficient collection routes.
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

