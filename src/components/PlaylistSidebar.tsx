import { Playlist, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { TrackSideBar } from "./TrackSidebar";
import { HiArrowPath, HiPlus, HiXMark } from "react-icons/hi2";
interface Props {
  className?: string;
  onClickChangePlaylist: () => void;
  playlist: Playlist | null;
}

export const PlaylistSidebar: React.FC<Props> = ({
  className = "",
  onClickChangePlaylist,
  playlist,
}) => {
  const utils = trpc.useContext();
  const playlistId = playlist?.id ?? "";
  const { data } = trpc.spotify.getPlaylistTracks.useQuery(playlistId, {
    enabled: !!playlistId,
  });
  const mutation = trpc.spotify.removeTrackToPlaylist.useMutation({
    onSuccess() {
      utils.spotify.getPlaylistTracks.invalidate();
    },
  });

  function handleRemoveTrack(trackId: string) {
    if (!playlist) return;
    mutation.mutate({ playlistId, trackId, snapshotId: playlist.snapshot_id });
  }

  return (
    <TrackSideBar title={playlist?.name ?? "Playlist"} className={className}>
      {data ? (
        <div>
          {data.map(({ track }) => {
            const image = track.album.images[0]?.url;
            return (
              <TrackCard key={track.id} name={track.name} image={image}>
                <button
                  className="btn-circle btn invisible absolute bottom-3 right-3 group-hover:visible"
                  onClick={() => handleRemoveTrack(track.id)}
                >
                  <HiXMark className="h-6 w-6" />
                </button>
              </TrackCard>
            );
          })}
        </div>
      ) : (
        <p className="mt-auto text-lg">Select a playlist to get started!</p>
      )}
      <button
        className="btn-primary btn-circle btn sticky bottom-0 mt-auto place-self-end"
        onClick={() => onClickChangePlaylist()}
      >
        {playlist ? (
          <HiArrowPath className="h-6 w-6" />
        ) : (
          <HiPlus className="h-6 w-6" />
        )}
      </button>
    </TrackSideBar>
  );
};
