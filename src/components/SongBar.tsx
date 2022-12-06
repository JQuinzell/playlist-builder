import React, { useEffect, useState } from "react";
import { Source, Track, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { TrackReview } from "./TrackReview";

interface Props {
  sources: Source[];
  playlistId: string;
}

type CurrentPage = Pick<Source, "id" | "type"> & {
  cursor: number;
};

export const SongBar: React.FC<Props> = ({ sources, playlistId }) => {
  // TODO: how does this respond if props change? I feel like the query might get a bit confused
  const startPage = sources[0];
  // TODO: is there a better way to handle this? enabled prevents undefined from ever being passed but I don't like this design
  const { data, hasNextPage, fetchNextPage } =
    trpc.spotify.getSourceTracks.useInfiniteQuery(startPage!, {
      enabled: !!startPage,
      getNextPageParam(lastPage) {
        return lastPage.next;
      },
    });

  const [removedSongs, setRemovedSongs] = useState<
    Record<string, boolean | undefined>
  >({});
  const items = data ? data.pages.flatMap((p) => p.items) : [];

  function removeSong(track: Track) {
    setRemovedSongs((songs) => ({ ...songs, [track.id]: true }));
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    const isBottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;
    if (isBottom && hasNextPage) {
      fetchNextPage();
    }
  }
  return (
    <div
      className="flex h-full flex-col gap-4 overflow-y-scroll"
      onScroll={handleScroll}
    >
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
