import { useState, useCallback } from 'react';
import { CONFIG } from '../config';
import type { BallotEntry } from '../types';

interface StoredBallot {
  username: string;
  entries: BallotEntry[];
  savedAt: string;
}

export function useLocalStorage() {
  const [restoredFromLocal, setRestoredFromLocal] = useState<boolean>(() => {
    return sessionStorage.getItem(CONFIG.LOCAL_STORAGE_RESTORED_KEY) === 'true';
  });

  const saveDraft = useCallback((username: string, entries: BallotEntry[]) => {
    const data: StoredBallot = {
      username,
      entries,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, []);

  const loadDraft = useCallback((username: string): BallotEntry[] | null => {
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (!stored) return null;

    try {
      const data: StoredBallot = JSON.parse(stored);
      if (data.username !== username) return null;
      return data.entries;
    } catch {
      return null;
    }
  }, []);

  const getDraftInfo = useCallback((username: string): { savedAt: string } | null => {
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (!stored) return null;

    try {
      const data: StoredBallot = JSON.parse(stored);
      if (data.username !== username) return null;
      return { savedAt: data.savedAt };
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY);
  }, []);

  const markAsRestored = useCallback(() => {
    sessionStorage.setItem(CONFIG.LOCAL_STORAGE_RESTORED_KEY, 'true');
    setRestoredFromLocal(true);
  }, []);

  const clearRestoredFlag = useCallback(() => {
    sessionStorage.removeItem(CONFIG.LOCAL_STORAGE_RESTORED_KEY);
    setRestoredFromLocal(false);
  }, []);

  return {
    saveDraft,
    loadDraft,
    getDraftInfo,
    clearDraft,
    restoredFromLocal,
    markAsRestored,
    clearRestoredFlag,
  };
}
