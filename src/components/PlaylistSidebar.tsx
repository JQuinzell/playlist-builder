import { Playlist, trpc } from "../utils/trpc";

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
  console.log(playlist);
  const playlistId = playlist?.id ?? "";
  const { data } = trpc.spotify.getPlaylistTracks.useQuery(playlistId, {
    enabled: !!playlistId,
  });
  console.log(data?.[0]);
  return (
    <div className={`flex h-5/6 w-96 flex-col ${className} mr-4`}>
      <h3 className="m-4 text-2xl">{playlist?.name ?? "Playlist"}</h3>
      <div className="relative flex grow flex-col place-items-center justify-center overflow-y-scroll rounded-lg bg-base-200 p-4">
        {data ? (
          <div>
            {data.map(({ track }) => {
              const image = track.album.images[0];
              return (
                <div
                  key={track.id}
                  className="group card h-min w-48 place-self-auto rounded-none bg-base-200 shadow-xl hover:bg-base-300"
                >
                  {/* TODO: add a placeholder image? */}
                  <figure className="h-48 w-full p-5">
                    {image && (
                      // TODO: how to make next/Image work
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="h-full w-full"
                        src={image.url}
                        alt={track.name}
                      />
                    )}
                  </figure>
                  <div className="card-body relative flex-initial justify-between p-4">
                    <h3 className="card-title text-base">{track.name}</h3>
                    <button
                      // onClick={() => onSelectPlaylist(playlist)}
                      className="btn-primary btn-circle btn invisible absolute bottom-3 right-3 group-hover:visible"
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
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
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
