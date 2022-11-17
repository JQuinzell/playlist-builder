import React from "react";
import { Track } from "../utils/trpc";
import { TrackCard } from "./TrackCard";
import { HiPlus, HiXMark } from "react-icons/hi2";

interface Props {
  track: Track;
}
export const TrackReview: React.FC<Props> = ({ track }) => {
  return (
    <TrackCard image={track.images[0]?.url} name={track.name}>
      <div className="flex">
        <button className="btn-circle btn h-20 w-20">
          <HiXMark className="h-20 w-20" />
        </button>
        <button className="btn-primary btn-circle btn ml-auto h-20 w-20">
          <HiPlus className="h-20 w-20" />
        </button>
      </div>
    </TrackCard>
  );
};
