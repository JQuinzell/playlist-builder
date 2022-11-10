import React, { ReactNode } from "react";

interface Props {
  image?: string;
  name: string;
  children?: ReactNode;
}

export const TrackCard: React.FC<Props> = ({ image, name, children }) => {
  return (
    <div className="group card mb-4 w-full place-self-auto rounded-none bg-base-200 shadow-xl hover:bg-base-300">
      {/* TODO: add a placeholder image? */}
      <figure className="w-full p-5">
        {image && (
          // TODO: how to make next/Image work
          // eslint-disable-next-line @next/next/no-img-element
          <img className="h-full w-full" src={image} alt={name} />
        )}
      </figure>
      <div className="card-body relative flex-initial justify-between p-4">
        <h3 className="card-title text-base">{name}</h3>
        {children}
      </div>
    </div>
  );
};
