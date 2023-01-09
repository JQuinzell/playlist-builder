import { useCallback, useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi2";
import { Source, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { useDebounce } from "../utils/useDebounce";

interface Props {
  open: boolean;
  onSelect: (source: Source[]) => void;
  onClose: () => void;
}

export const SourceModal: React.FC<Props> = ({ open, onSelect, onClose }) => {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [selectedIds, setSelectedIds] = useState<
    Record<string, boolean | undefined>
  >({});

  const { data } = trpc.spotify.search.useQuery(debouncedSearch, {
    enabled: search !== "",
  });

  const handleClose = useCallback(() => {
    setSearch("");
    setSelectedIds({});
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose, open]);

  const items = data
    ? [...data.albums.items, ...data.playlists.items].sort((a, b) =>
        a.name < b.name ? 1 : -1
      )
    : [];

  function selectSource(id: string) {
    const isSelected = selectedIds[id];
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !isSelected,
    }));
  }

  function addSelectedSources() {
    const sources = items.filter(({ id }) => selectedIds[id]);
    handleClose();
    onSelect(sources);
  }

  return (
    <div
      className={`modal ${open ? "modal-open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-box flex h-5/6 w-11/12 max-w-5xl flex-col overflow-hidden">
        <div className="mb-5 flex items-baseline">
          <h2 className="mr-5 text-xl font-bold">Sources</h2>
          <input
            type="text"
            value={search}
            placeholder="Search for a source"
            className="input-bordered input w-full max-w-xs"
            onChange={(e) =>
              setSearch(e.currentTarget.value.toLocaleLowerCase())
            }
          />
          <button
            className="btn-primary btn-circle btn ml-auto"
            onClick={() => addSelectedSources()}
          >
            <HiPlus className="h-6 w-6" />
          </button>
        </div>
        <div className="grid auto-cols-max auto-rows-max grid-cols-4 gap-4 overflow-y-scroll">
          {items.map((item) => {
            const image = item.images[0]?.url;
            return (
              <TrackCard
                key={item.id}
                image={image}
                name={`${item.type}: ${item.name}`}
                selected={selectedIds[item.id]}
              >
                <button
                  className="btn-primary btn-circle btn invisible absolute bottom-3 right-3 group-hover:visible"
                  onClick={() => selectSource(item.id)}
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
