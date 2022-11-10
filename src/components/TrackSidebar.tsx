import React, { ReactNode } from "react";

interface Props {
  className: string;
  title: string;
  children: ReactNode;
}

export const TrackSideBar: React.FC<Props> = ({
  className,
  title,
  children,
}) => {
  return (
    <div className={`flex h-5/6 w-96 flex-col ${className} mr-4`}>
      <h3 className="m-4 text-2xl">{title}</h3>
      <div className="relative flex grow flex-col place-items-center justify-start overflow-y-scroll rounded-lg bg-base-200 p-4">
        {children}
      </div>
    </div>
  );
};
