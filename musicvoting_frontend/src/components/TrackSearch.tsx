import { useState, useCallback, useRef } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { searchTracks } from '../api';
import type { SpotifyTrack } from '../types';
import { CONFIG } from '../config';

interface TrackSearchProps {
  onSelect: (track: SpotifyTrack) => void;
  excludeIds?: string[];
}

function isTrackInDateRange(track: SpotifyTrack): boolean {
  const releaseDate = new Date(track.album.release_date);
  const startDate = new Date(CONFIG.VOTE_START_DATE);
  const endDate = new Date(CONFIG.VOTE_END_DATE);
  return releaseDate >= startDate && releaseDate <= endDate;
}

export function TrackSearch({ onSelect, excludeIds = [] }: TrackSearchProps) {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setTracks([]);
        setSearchError(null);
        return;
      }

      setIsLoading(true);
      setSearchError(null);
      try {
        const results = await searchTracks(searchQuery);
        setTracks(results.filter((t) => !excludeIds.includes(t.id)));
      } catch (error) {
        console.error('Search failed:', error);
        setTracks([]);
        setSearchError('Search failed. Check if the Spotify API server is running.');
      } finally {
        setIsLoading(false);
      }
    },
    [excludeIds]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSelect = (track: SpotifyTrack | null) => {
    if (track) {
      onSelect(track);
      setQuery('');
      setTracks([]);
    }
  };

  return (
    <div className="relative">
      <Combobox value={null} onChange={handleSelect}>
        <div className="relative">
          <ComboboxInput
            className="w-full rounded-xl border border-slate-600/50 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            placeholder="Search for a song..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
        </div>

        {searchError && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-rose-500/50 bg-rose-900/30 p-3">
            <p className="text-sm text-rose-300">{searchError}</p>
          </div>
        )}

        {tracks.length > 0 && !searchError && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-slate-600/50 bg-slate-800 shadow-xl">
            {tracks.map((track) => {
              const inRange = isTrackInDateRange(track);
              return (
                <ComboboxOption
                  key={track.id}
                  value={track}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-3 transition-colors ${
                      active ? 'bg-slate-700/60' : ''
                    } ${!inRange ? 'opacity-60' : ''}`
                  }
                >
                  <div className="flex items-center gap-3">
                    {track.album.images[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt=""
                        className="h-12 w-12 rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-slate-100 font-medium">{track.name}</p>
                      <p className="truncate text-sm text-slate-400">
                        {track.artists.map((a) => a.name).join(', ')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {track.album.name} ({track.album.release_date.slice(0, 4)})
                      </p>
                    </div>
                    {!inRange && (
                      <span className="shrink-0 rounded-lg bg-amber-900/30 px-2 py-1 text-xs text-amber-400">
                        Outside {CONFIG.VOTE_YEAR}
                      </span>
                    )}
                  </div>
                </ComboboxOption>
              );
            })}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
}
