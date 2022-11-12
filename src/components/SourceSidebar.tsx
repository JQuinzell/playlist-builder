import React from "react";
import { Source } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { TrackSideBar } from "./TrackSidebar";

interface Props {
  className: string;
  sources: Source[];
  onAddSources: () => void;
}

export const SourceSidebar: React.FC<Props> = ({
  className,
  sources,
  onAddSources,
}) => {
  return (
    <TrackSideBar className={className} title="Sources">
      {sources.length ? (
        <div>
          {sources.map((source) => {
            const image = source.images[0]?.url;
            return (
              <TrackCard key={source.id} name={source.name} image={image} />
            );
          })}
        </div>
      ) : (
        <p className="mt-auto text-lg">Select some sources to get started!</p>
      )}
      <button
        className="btn-primary btn-circle btn sticky bottom-0 mt-auto place-self-end"
        onClick={() => onAddSources()}
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
    </TrackSideBar>
  );
};
