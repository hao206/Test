import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  lang: 'en' | 'vi';
  accent: string;
  mobileMenuOpen: boolean;
  guestBlockAction: string | null;
  gQuery: string;
  setLang: (lang: 'en' | 'vi') => void;
  setAccent: (accent: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setGuestBlockAction: (action: string | null) => void;
  setGQuery: (q: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      lang: 'vi', // default to vi as seen in auto-detection, it is fine
      accent: '#CCFF00',
      mobileMenuOpen: false,
      guestBlockAction: null,
      gQuery: '',
      setLang: (lang) => set({ lang }),
      setAccent: (accent) => set({ accent }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setGuestBlockAction: (guestBlockAction) => set({ guestBlockAction }),
      setGQuery: (gQuery) => set({ gQuery }),
    }),
    {
      name: 'cfg_ui_store',
      partialize: (state) => ({ lang: state.lang, accent: state.accent }),
    }
  )
);
