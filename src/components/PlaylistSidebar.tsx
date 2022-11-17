import { Playlist, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { TrackSideBar } from "./TrackSidebar";
import { HiArrowPath } from "react-icons/hi2";
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
  const playlistId = playlist?.id ?? "";
  const { data } = trpc.spotify.getPlaylistTracks.useQuery(playlistId, {
    enabled: !!playlistId,
  });
  return (
    <TrackSideBar title={playlist?.name ?? "Playlist"} className={className}>
      {data ? (
        <div>
          {data.map(({ track }) => {
            const image = track.album.images[0]?.url;
            return <TrackCard key={track.id} name={track.name} image={image} />;
          })}
        </div>
      ) : (
        <p className="mt-auto text-lg">Select a playlist to get started!</p>
      )}
      <button
        className="btn-primary btn-circle btn sticky bottom-0 mt-auto place-self-end"
        onClick={() => onClickChangePlaylist()}
      >
        <HiArrowPath className="h-6 w-6" />
      </button>
    </TrackSideBar>
  );
};
