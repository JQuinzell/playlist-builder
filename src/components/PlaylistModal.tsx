import { useState } from "react";
import { HiPlus } from "react-icons/hi2";
import type { Playlist } from "../utils/trpc";
import { TrackCard } from "./TrackCard";

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
              const image = playlist.images[0]?.url;
              return (
                <TrackCard key={playlist.id} image={image} name={playlist.name}>
                  <button
                    onClick={() => onSelectPlaylist(playlist)}
                    className="btn-primary btn-circle btn invisible absolute bottom-3 right-3 group-hover:visible"
                  >
                    <HiPlus className="h-6 w-6" />
                  </button>
                </TrackCard>
              );
            })}
        </div>
      </div>
    </div>
  );
};
