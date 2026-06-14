'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { MOCK_USER_PRIYA } from '@/lib/mockData';

export default function UserStoreInitializer() {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setUser(MOCK_USER_PRIYA);
  }, [setUser]);

  return null;
}
