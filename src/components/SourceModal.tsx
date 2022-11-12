import { useState } from "react";
import { Source, trpc } from "../utils/trpc";
import { TrackCard } from "./TrackCard";

interface Props {
  open: boolean;
  onSelect: (source: Source[]) => void;
}

export const SourceModal: React.FC<Props> = ({ open, onSelect }) => {
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<
    Record<string, boolean | undefined>
  >({});
  const { data } = trpc.spotify.search.useQuery(search, {
    enabled: search !== "",
  });

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
    onSelect(sources);
  }

  return (
    <div className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box flex h-5/6 w-11/12 max-w-5xl flex-col overflow-hidden">
        <div className="mb-5 flex items-baseline">
          <h2 className="mr-5 text-xl font-bold">Sources</h2>
          <input
            type="text"
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
              </TrackCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
