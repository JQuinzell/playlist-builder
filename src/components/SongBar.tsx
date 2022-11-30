import React from "react";
import { Source, Track, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { TrackReview } from "./TrackReview";

interface Props {
  sources: Source[];
  playlistId: string;
}

export const SongBar: React.FC<Props> = ({ sources, playlistId }) => {
  const { data } = trpc.spotify.getSourceTracks.useQuery(sources);
  const items = data ?? [];
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-scroll">
      {items.map((track) => (
        <div key={track.id} className="w-96 shrink-0">
          <TrackReview track={track} playlistId={playlistId} />
        </div>
      ))}
    </div>
  );
};
