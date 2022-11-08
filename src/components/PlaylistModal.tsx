import { useState } from "react";
import type { Playlist } from "../utils/trpc";

interface Props {
  playlists: Playlist[];
  open: boolean;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const PlaylistModal: React.FC<Props> = ({
  playlists,
  open,
  onSelectPlaylist,
}) => {
  console.log(`modal is open? ${open}`);
  const [search, setSearch] = useState("");

  return (
    <div className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box flex h-5/6 w-11/12 max-w-5xl flex-col overflow-hidden">
        <div className="mb-5 flex items-baseline">
          <h2 className="mr-5 text-xl font-bold">Playlists</h2>
          <input
            type="text"
            placeholder="Search for a playlist"
            className="input-bordered input  w-full max-w-xs"
            onChange={(e) =>
              setSearch(e.currentTarget.value.toLocaleLowerCase())
            }
          />
        </div>
        <div className="grid auto-cols-max auto-rows-max grid-cols-4 gap-4 overflow-y-scroll">
          {playlists
            .filter(({ name }) => name.toLocaleLowerCase().includes(search))
            .map((playlist) => {
              const image = playlist.images[0];
              return (
                <div
                  key={playlist.id}
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
                        alt={playlist.name}
                      />
                    )}
                  </figure>
                  <div className="card-body relative flex-initial justify-between p-4">
                    <h3 className="card-title text-base">{playlist.name}</h3>
                    <button
                      onClick={() => onSelectPlaylist(playlist)}
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
      </div>
    </div>
  );
};
