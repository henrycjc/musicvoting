import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BallotEntry, RankingAlgorithm } from '../types';
import { CONFIG } from '../config';

interface SortableTrackProps {
  entry: BallotEntry;
  onRemove: (trackId: string) => void;
  algorithm?: RankingAlgorithm;
}

function getPointValue(rank: number, algorithm: RankingAlgorithm): string {
  switch (algorithm) {
    case 'borda':
      return `${CONFIG.MAX_SONGS - rank + 1}pts`;
    case 'harmonic':
      return `${(1 / rank).toFixed(2)}pts`;
    case 'logarithmic':
      return `${Math.log2(CONFIG.MAX_SONGS + 2 - rank).toFixed(2)}pts`;
    case 'exponential':
      return `${Math.pow(2, CONFIG.MAX_SONGS - rank).toFixed(0)}pts`;
    case 'bayesian':
      return `${((CONFIG.MAX_SONGS - rank + 1) / CONFIG.MAX_SONGS).toFixed(2)}pts`;
    default:
      return '';
  }
}

function isTrackInDateRange(releaseDate: string): boolean {
  const date = new Date(releaseDate);
  const startDate = new Date(CONFIG.VOTE_START_DATE);
  const endDate = new Date(CONFIG.VOTE_END_DATE);
  return date >= startDate && date <= endDate;
}

export function SortableTrack({ entry, onRemove, algorithm }: SortableTrackProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.trackId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { track } = entry;
  const inRange = isTrackInDateRange(track.album.release_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-gray-800 p-3 ${
        isDragging
          ? 'border-green-500 shadow-lg shadow-green-500/20 z-50'
          : 'border-gray-700'
      } ${!inRange ? 'border-yellow-600/50' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex flex-col h-12 w-12 shrink-0 cursor-grab items-center justify-center rounded bg-gray-700 active:cursor-grabbing"
      >
        <span className="text-lg font-bold text-white">{entry.rank}</span>
        {algorithm && (
          <span className="text-[10px] text-green-400">{getPointValue(entry.rank, algorithm)}</span>
        )}
      </div>

      {track.album.images[2] && (
        <img
          src={track.album.images[2].url}
          alt=""
          className="h-12 w-12 shrink-0 rounded"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-white">{track.name}</p>
        <p className="truncate text-sm text-gray-400">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
      </div>

      {!inRange && (
        <span className="shrink-0 rounded bg-yellow-900/50 px-2 py-1 text-xs text-yellow-400">
          Outside {CONFIG.VOTE_YEAR}
        </span>
      )}

      <button
        type="button"
        onClick={() => onRemove(entry.trackId)}
        className="shrink-0 rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-red-400"
        aria-label="Remove track"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
