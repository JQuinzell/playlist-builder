import React from "react";
import { Source, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";

interface Props {
  sources: Source[];
}

export const SongBar: React.FC<Props> = ({ sources }) => {
  const { data } = trpc.spotify.getSourceTracks.useQuery(sources);
  console.log(data?.[0]?.items?.[0]);
  const items = data?.flatMap(({ items }) => items) ?? [];
  console.log(data);
  return (
    <div className="flex h-max gap-4 overflow-x-scroll">
      {items.map(({ track }) => (
        <div key={track.id ?? track.name} className="h-full w-48 shrink-0">
          <TrackCard
            image={track.album?.images?.[0]?.url}
            name={track.name ?? "No Name?"}
          />
        </div>
      ))}
    </div>
  );
};
