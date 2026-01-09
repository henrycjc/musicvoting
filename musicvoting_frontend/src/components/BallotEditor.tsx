import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { TrackSearch } from './TrackSearch';
import { SortableTrack } from './SortableTrack';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CONFIG } from '../config';
import type { BallotEntry, SpotifyTrack, RankingAlgorithm } from '../types';

const ALGORITHMS: { id: RankingAlgorithm; name: string; description: string }[] = [
  { id: 'borda', name: 'Borda Count', description: '1st=20pts, 20th=1pt' },
  { id: 'harmonic', name: 'Harmonic', description: '1st=1pt, 2nd=0.5pt' },
  { id: 'logarithmic', name: 'Logarithmic', description: 'log2 scale' },
  { id: 'bayesian', name: 'Bayesian', description: '0-1 normalized' },
];

interface BallotEditorProps {
  username: string;
  initialEntries?: BallotEntry[];
  onSave: (entries: BallotEntry[]) => Promise<void>;
  onDelete?: () => Promise<void>;
  hasExistingBallot: boolean;
}

export function BallotEditor({
  username,
  initialEntries = [],
  onSave,
  onDelete,
  hasExistingBallot,
}: BallotEditorProps) {
  const [entries, setEntries] = useState<BallotEntry[]>(initialEntries);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<RankingAlgorithm>('borda');
  const { saveDraft, loadDraft, getDraftInfo, clearDraft, markAsRestored, restoredFromLocal } =
    useLocalStorage();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialEntries.length === 0 && !restoredFromLocal) {
      const draft = loadDraft(username);
      const draftInfo = getDraftInfo(username);
      if (draft && draft.length > 0) {
        setEntries(draft);
        markAsRestored();
        setShowRestoredBanner(true);
      }
      if (draftInfo) {
        console.log('Restored draft from:', draftInfo.savedAt);
      }
    }
  }, [username, initialEntries.length, loadDraft, getDraftInfo, markAsRestored, restoredFromLocal]);

  useEffect(() => {
    if (entries.length > 0) {
      saveDraft(username, entries);
    }
  }, [entries, username, saveDraft]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEntries((items) => {
        const oldIndex = items.findIndex((i) => i.trackId === active.id);
        const newIndex = items.findIndex((i) => i.trackId === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }
  }, []);

  const handleAddTrack = useCallback((track: SpotifyTrack) => {
    setEntries((prev) => {
      if (prev.length >= CONFIG.MAX_SONGS) {
        alert(`Maximum ${CONFIG.MAX_SONGS} songs allowed`);
        return prev;
      }
      const newEntry: BallotEntry = {
        rank: prev.length + 1,
        trackId: track.id,
        track,
      };
      return [...prev, newEntry];
    });
  }, []);

  const handleRemoveTrack = useCallback((trackId: string) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.trackId !== trackId);
      return filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });
  }, []);

  const handleSubmit = async () => {
    if (entries.length !== CONFIG.MAX_SONGS) {
      alert(`Please select exactly ${CONFIG.MAX_SONGS} songs`);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(entries);
      clearDraft();
    } catch (error) {
      console.error('Failed to save ballot:', error);
      alert('Failed to save ballot. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRescind = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to rescind your vote? This cannot be undone.')) {
      return;
    }
    setIsSaving(true);
    try {
      await onDelete();
      setEntries([]);
    } catch (error) {
      console.error('Failed to rescind ballot:', error);
      alert('Failed to rescind ballot. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const excludeIds = entries.map((e) => e.trackId);

  return (
    <div className="space-y-6">
      {showRestoredBanner && (
        <div className="rounded-lg bg-blue-900/50 border border-blue-500 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-blue-200">Draft restored from local storage</p>
              <p className="text-sm text-blue-300/80 mt-1">
                Your previous draft has been restored. This is saved locally on your device.
              </p>
            </div>
            <button
              onClick={() => setShowRestoredBanner(false)}
              className="text-blue-400 hover:text-blue-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {hasExistingBallot && (
        <div className="rounded-lg bg-green-900/50 border border-green-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-200">Ballot already submitted</p>
              <p className="text-sm text-green-300/80">
                You can rescind your vote to make changes and resubmit.
              </p>
            </div>
            <button
              onClick={handleRescind}
              disabled={isSaving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSaving ? 'Rescinding...' : 'Rescind Vote'}
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Add Songs</h3>
        <TrackSearch onSelect={handleAddTrack} excludeIds={excludeIds} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-white">
            Your Top {CONFIG.MAX_SONGS} ({entries.length}/{CONFIG.MAX_SONGS})
          </h3>
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <p className="text-sm text-gray-400 hidden sm:block">Drag to reorder</p>
            )}
            <Listbox value={selectedAlgorithm} onChange={setSelectedAlgorithm}>
              <div className="relative">
                <ListboxButton className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-white">
                  <span>{ALGORITHMS.find(a => a.id === selectedAlgorithm)?.name}</span>
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </ListboxButton>
                <ListboxOptions className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-gray-600 bg-gray-700 py-1 shadow-lg">
                  {ALGORITHMS.map((algo) => (
                    <ListboxOption
                      key={algo.id}
                      value={algo.id}
                      className={({ active }) =>
                        `cursor-pointer px-3 py-2 ${active ? 'bg-green-600 text-white' : 'text-gray-200'}`
                      }
                    >
                      <div>
                        <p className="font-medium">{algo.name}</p>
                        <p className="text-xs opacity-70">{algo.description}</p>
                      </div>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-700 p-8 text-center">
            <p className="text-gray-400">No songs added yet. Search above to add songs.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={entries.map((e) => e.trackId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {entries.map((entry) => (
                  <SortableTrack
                    key={entry.trackId}
                    entry={entry}
                    onRemove={handleRemoveTrack}
                    algorithm={selectedAlgorithm}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          {entries.length === CONFIG.MAX_SONGS
            ? 'Ready to submit!'
            : `Add ${CONFIG.MAX_SONGS - entries.length} more song${CONFIG.MAX_SONGS - entries.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={handleSubmit}
          disabled={entries.length !== CONFIG.MAX_SONGS || isSaving || hasExistingBallot}
          className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Submitting...' : 'Submit Ballot'}
        </button>
      </div>
    </div>
  );
}
