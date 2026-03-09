'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type RealtimeCallback = () => void;

export function useMenuRealtime(orgId: string, onUpdate: RealtimeCallback) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`menu:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_categories',
          filter: `organization_id=eq.${orgId}`,
        },
        () => callbackRef.current()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: `organization_id=eq.${orgId}`,
        },
        () => callbackRef.current()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);
}
