import React, { useState } from "react";
import { Source, Track, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { TrackReview } from "./TrackReview";

interface Props {
  sources: Source[];
  playlistId: string;
}

export const SongBar: React.FC<Props> = ({ sources, playlistId }) => {
  const { data } = trpc.spotify.getSourceTracks.useQuery(sources);
  const [removedSongs, setRemovedSongs] = useState<
    Record<string, boolean | undefined>
  >({});
  const items = data ?? [];

  function removeSong(track: Track) {
    setRemovedSongs((songs) => ({ ...songs, [track.id]: true }));
  }
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-scroll">
      {items
        .filter((track) => !removedSongs[track.id])
        .map((track) => (
          <div key={track.id} className="w-96 shrink-0">
            <TrackReview
              track={track}
              playlistId={playlistId}
              onAdd={() => removeSong(track)}
              onRemove={() => removeSong(track)}
            />
          </div>
        ))}
    </div>
  );
};
