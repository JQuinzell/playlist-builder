import type { NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { trpc, Playlist, Source } from "../utils/trpc";
import React, { useState } from "react";
import { PlaylistModal } from "../components/PlaylistModal";
import { PlaylistSidebar } from "../components/PlaylistSidebar";
import { SourceSidebar } from "../components/SourceSidebar";
import { SourceModal } from "../components/SourceModal";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);
  const response = trpc.spotify.getPlaylists.useQuery();
  const playlists = response.data ?? [];

  function selectPlaylist(playlist: Playlist) {
    setModalOpen(false);
    setSelectedPlaylist(playlist);
  }

  function selectSources(sources: Source[]) {
    setSelectedSources(sources);
    setSourcesModalOpen(false);
  }

  return (
    <>
      <Head>
        <title>Create Playlist</title>
        <meta name="description" content="create a spotify playlist" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="h-screen">
        {sessionData ? null : (
          <button className="btn-primary btn" onClick={() => signIn()}>
            Log in
          </button>
        )}
        <SourceModal open={sourcesModalOpen} onSelect={selectSources} />
        <PlaylistModal
          open={modalOpen}
          playlists={playlists}
          onSelectPlaylist={selectPlaylist}
        />
        <div className="flex h-full">
          <SourceSidebar
            className="self-center"
            sources={selectedSources}
            onAddSources={() => setSourcesModalOpen(true)}
          />
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
