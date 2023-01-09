import type { NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { trpc, Playlist, Source } from "../utils/trpc";
import React, { useState } from "react";
import { PlaylistModal } from "../components/PlaylistModal";
import { PlaylistSidebar } from "../components/PlaylistSidebar";
import { SourceSidebar } from "../components/SourceSidebar";
import { SourceModal } from "../components/SourceModal";
import { SongBar } from "../components/SongBar";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<
    Array<Source & { current: boolean }>
  >([]);
  const response = trpc.spotify.getPlaylists.useQuery();
  const playlists = response.data ?? [];

  function selectPlaylist(playlist: Playlist) {
    setModalOpen(false);
    setSelectedPlaylist(playlist);
  }

  function selectSources(sources: Source[]) {
    setSelectedSources(
      sources.map((source, i) => ({ ...source, current: i === 0 }))
    );
    setSourcesModalOpen(false);
  }

  function showSource(source: Source) {
    setSelectedSources((prev) =>
      prev.map((prevSource) => ({
        ...prevSource,
        current: prevSource.id === source.id,
      }))
    );
  }

  function removeSource(source: Source) {
    setSelectedSources((prev) => prev.filter(({ id }) => id !== source.id));
  }

  const currentSource = selectedSources.find(({ current }) => current);

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
        <SourceModal
          open={sourcesModalOpen}
          onSelect={selectSources}
          onClose={() => setSourcesModalOpen(false)}
        />
        <PlaylistModal
          open={modalOpen}
          playlists={playlists}
          onSelectPlaylist={selectPlaylist}
          onClose={() => setModalOpen(false)}
        />
        <div className="flex h-full">
          <SourceSidebar
            className="mr-auto self-center"
            sources={selectedSources}
            onClickAdd={() => setSourcesModalOpen(true)}
            onClickShow={showSource}
            onRemoveSource={removeSource}
          />

          {selectedPlaylist && currentSource && (
            <SongBar source={currentSource} playlistId={selectedPlaylist?.id} />
          )}

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
