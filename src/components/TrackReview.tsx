import React from "react";
import { trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { HiXMark, HiCheck } from "react-icons/hi2";
import { Image, Track } from "../server/trpc/router/schemas";

interface Props {
  track: Track;
  images: Image[];
  playlistId: string;
  onAdd: () => void;
  onRemove: () => void;
}

export const TrackReview: React.FC<Props> = ({
  track,
  images,
  playlistId,
  onAdd,
  onRemove,
}) => {
  const utils = trpc.useContext();
  const mutation = trpc.spotify.addTrackToPlaylist.useMutation({
    onSuccess() {
      utils.spotify.getPlaylistTracks.invalidate();
    },
  });

  function onClickAdd() {
    mutation.mutate({ id: track.id, playlistId });
    onAdd();
  }

  function onClickRemove() {
    onRemove();
  }

  return (
    <TrackCard image={images[0]?.url} name={track.name}>
      <div className="flex">
        <button className="btn-circle btn h-20 w-20">
          <HiXMark className="h-20 w-20" onClick={onClickRemove} />
        </button>
        <button
          onClick={onClickAdd}
          className="btn-primary btn-circle btn ml-auto h-20 w-20"
        >
          <HiCheck className="h-20 w-20" />
        </button>
      </div>
    </TrackCard>
  );
};
