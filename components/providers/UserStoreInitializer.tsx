'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useCartStore } from '@/lib/stores/useCartStore';
import { MOCK_USER_PRIYA } from '@/lib/mockData';

export default function UserStoreInitializer() {
  const { user: clerkUser, isLoaded } = useUser();
  const setUser = useUserStore((s) => s.setUser);
  const hydrateCart = useCartStore((s) => s.hydrate);

  useEffect(() => {
    if (!isLoaded) return; // wait until Clerk finishes loading

    if (clerkUser) {
      // Use the real Clerk user — keep all Priya's demo data (cart, history,
      // rituals, preferences) but swap out the display name and id.
      const realName =
        clerkUser.fullName ||
        `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
        clerkUser.username ||
        'there';

      setUser({
        ...MOCK_USER_PRIYA,
        id: clerkUser.id,
        name: realName,
      });
    } else {
      // Not signed in — use the full mock profile for demo purposes
      setUser(MOCK_USER_PRIYA);
    }

    hydrateCart();
  }, [isLoaded, clerkUser, setUser, hydrateCart]);

  return null;
}
