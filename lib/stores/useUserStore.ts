'use client';

import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface UserStore {
  user: UserProfile | null;
  pincode: string;
  setUser: (user: UserProfile) => void;
  setPincode: (pincode: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  pincode: '110001',
  setUser: (user) => set({ user, pincode: user.pincode }),
  setPincode: (pincode) => set({ pincode }),
}));
