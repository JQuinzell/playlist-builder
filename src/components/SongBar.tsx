import React, { useState } from "react";
import { Track, trpc } from "../utils/trpc";
import { TrackReview } from "./TrackReview";
import { Source } from "../server/trpc/router/schemas";

interface Props {
  source: Source;
  playlistId: string;
}

export const SongBar: React.FC<Props> = ({ source, playlistId }) => {
  const { data, hasNextPage, fetchNextPage } =
    trpc.spotify.getSourceTracks.useInfiniteQuery(source, {
      enabled: !!source,
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
      className="flex h-full w-96 flex-col gap-4 overflow-y-scroll"
      onScroll={handleScroll}
    >
      {items
        .filter((track) => !removedSongs[track.id])
        .map((track) => (
          <div key={track.id} className="w-96 shrink-0">
            <TrackReview
              track={track}
              images={"album" in track ? track.album.images : source.images}
              playlistId={playlistId}
              onAdd={() => removeSong(track)}
              onRemove={() => removeSong(track)}
            />
          </div>
        ))}
    </div>
  );
};
