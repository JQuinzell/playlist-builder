import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc, AppRouterTypes, Playlist } from "../utils/trpc";
import React, { useState } from "react";
import Image from "next/image";
import { PlaylistModal } from "../components/PlaylistModal";
import { PlaylistSidebar } from "../components/PlaylistSidebar";

const Home: NextPage = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const response = trpc.spotify.getPlaylists.useQuery();
  const playlists = response.data ?? [];

  function selectPlaylist(playlist: Playlist) {
    setModalOpen(false);
    setSelectedPlaylist(playlist);
  }

  return (
    <>
      <Head>
        <title>Create Playlist</title>
        <meta name="description" content="create a spotify playlist" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="h-screen">
        <PlaylistModal
          open={modalOpen}
          playlists={playlists}
          onSelectPlaylist={selectPlaylist}
        />
        <div className="flex h-full">
          <PlaylistSidebar
            className="ml-auto self-center"
            playlist={selectedPlaylist}
            onClickChangePlaylist={() => setModalOpen(true)}
          />
        </div>
      </main>
    </>
  );
};

export default Home;

// const AuthShowcase: React.FC = () => {
//   const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery();

//   const { data: sessionData } = useSession();

//   return (
//     <div className="flex flex-col items-center justify-center gap-2">
//       {sessionData && (
//         <p className="text-2xl text-blue-500">
//           Logged in as {sessionData?.user?.name}
//         </p>
//       )}
//       {secretMessage && (
//         <p className="text-2xl text-blue-500">{secretMessage}</p>
//       )}
//       <button
//         className="rounded-md border border-black bg-violet-50 px-4 py-2 text-xl shadow-lg hover:bg-violet-100"
//         onClick={sessionData ? () => signOut() : () => signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// };
