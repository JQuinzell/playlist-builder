import React from "react";
import { Source, Track, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";

interface Props {
  sources: Source[];
  onSelectTrack: (track: Track) => void;
}

export const SongBar: React.FC<Props> = ({ sources, onSelectTrack }) => {
  const { data } = trpc.spotify.getSourceTracks.useQuery(sources, {
    onSuccess(data) {
      const track = data.at(-1);
      if (track) onSelectTrack(track);
    },
  });
  const items = data ?? [];
  return (
    <div className="flex h-max gap-4 overflow-x-scroll">
      {items.map(({ id, name, images }) => (
        <div key={id ?? name} className="h-full w-48 shrink-0">
          <TrackCard image={images?.[0]?.url} name={name ?? "No Name?"} />
        </div>
      ))}
    </div>
  );
};
