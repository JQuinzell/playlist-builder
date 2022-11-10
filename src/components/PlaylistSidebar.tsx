import { Playlist, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { TrackSideBar } from "./TrackSidebar";

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </TrackSideBar>
  );
};
