"use client";
import * as React from 'react';
import CollectionMap from "@/components/provider/collection-map";
import { DUMMY_CLIENTS } from "@/lib/data";
import { useLanguage } from "@/context/language-context";
import type { Client } from '@/lib/types';

export default function ProviderMapPage() {
  const { t } = useLanguage();
  
  const allVisibleClients = DUMMY_CLIENTS.filter(c => c.sharesLocation);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden">
        <div className="flex-shrink-0 mb-4">
            <h2 className="text-2xl font-bold">{t('map_title')}</h2>
            <p className="text-muted-foreground">{t('map_subtitle')}</p>
        </div>
        <div className="flex-grow relative h-full w-full">
            <CollectionMap
                clients={allVisibleClients}
            />
        </div>
    </div>
  );
}
