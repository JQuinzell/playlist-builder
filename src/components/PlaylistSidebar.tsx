import { Playlist } from "../utils/trpc";

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
  return (
    <div className={`flex h-5/6 w-96 flex-col ${className} mr-4`}>
      <h3 className="m-4 text-2xl">{playlist?.name ?? "Playlist"}</h3>
      <div className="relative flex grow flex-col place-items-center justify-center rounded-lg bg-base-200 p-4">
        <p className="text-lg">Select a playlist to get started!</p>
        <button
          className="btn-primary btn-circle btn absolute bottom-4 right-4"
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
      </div>
    </div>
  );
};
