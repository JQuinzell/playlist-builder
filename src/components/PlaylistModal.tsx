import { useEffect, useRef, useState } from "react";
import { HiPlus, HiXMark } from "react-icons/hi2";
import type { Playlist } from "../utils/trpc";
import { TrackCard } from "./TrackCard";

interface Props {
  playlists: Playlist[];
  open: boolean;
  onSelectPlaylist: (playlist: Playlist) => void;
  onClose: () => void;
}

export const PlaylistModal: React.FC<Props> = ({
  playlists,
  open,
  onSelectPlaylist,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        console.log("ESCAPING PL");
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  return (
    <div
      ref={modalRef}
      className={`modal ${open ? "modal-open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
          <button
            className="btn-primary btn-circle btn ml-auto"
            onClick={() => onClose()}
          >
            <HiXMark className="h-6 w-6" />
          </button>
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
