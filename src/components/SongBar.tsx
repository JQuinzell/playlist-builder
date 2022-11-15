import React from "react";
import { Source, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";

interface Props {
  sources: Source[];
}

export const SongBar: React.FC<Props> = ({ sources }) => {
  const { data } = trpc.spotify.getSourceTracks.useQuery(sources);
  const items = data ?? [];
  console.log(items);
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
