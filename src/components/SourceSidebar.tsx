import React from "react";
import { HiArrowRight, HiPlus, HiXMark } from "react-icons/hi2";
import { TrackCard } from "./TrackCard";
import { TrackSideBar } from "./TrackSidebar";
import { Source } from "../server/trpc/router/schemas";

interface Props {
  className: string;
  sources: Source[];
  onClickAdd: () => void;
  onClickShow: (source: Source) => void;
  onRemoveSource: (source: Source) => void;
}

export const SourceSidebar: React.FC<Props> = ({
  className,
  sources,
  onClickAdd,
  onClickShow,
  onRemoveSource,
}) => {
  return (
    <TrackSideBar className={className} title="Sources">
      {sources.length ? (
        <div>
          {sources.map((source) => {
            const image = source.images[0]?.url;
            return (
              <TrackCard key={source.id} name={source.name} image={image}>
                <div className="flex">
                  <button
                    onClick={() => onRemoveSource(source)}
                    className="btn-danger btn-circle btn"
                  >
                    <HiXMark className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => onClickShow(source)}
                    className="btn-primary btn-circle btn ml-auto"
                  >
                    <HiArrowRight className="h-6 w-6" />
                  </button>
                </div>
              </TrackCard>
            );
          })}
        </div>
      ) : (
        <p className="mt-auto text-lg">Select some sources to get started!</p>
      )}
      <button
        className="btn-primary btn-circle btn sticky bottom-0 mt-auto place-self-end"
        onClick={() => onClickAdd()}
      >
        <HiPlus className="h-6 w-6" />
      </button>
    </TrackSideBar>
  );
};
