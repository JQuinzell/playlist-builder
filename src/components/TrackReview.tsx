import React from "react";
import { Track, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { HiXMark, HiCheck } from "react-icons/hi2";

interface Props {
  track: Track;
  playlistId: string;
}
export const TrackReview: React.FC<Props> = ({ track, playlistId }) => {
  const mutation = trpc.spotify.addTrackToPlaylist.useMutation();
  return (
    <TrackCard image={track.images[0]?.url} name={track.name}>
      <div className="flex">
        <button className="btn-circle btn h-20 w-20">
          <HiXMark className="h-20 w-20" />
        </button>
        <button
          onClick={() => mutation.mutate({ id: track.id, playlistId })}
          className="btn-primary btn-circle btn ml-auto h-20 w-20"
        >
          <HiCheck className="h-20 w-20" />
        </button>
      </div>
    </TrackCard>
  );
};
