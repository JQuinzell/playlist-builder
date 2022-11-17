import type { NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { trpc, Playlist, Source, Track } from "../utils/trpc";
import React, { useState } from "react";
import { PlaylistModal } from "../components/PlaylistModal";
import { PlaylistSidebar } from "../components/PlaylistSidebar";
import { SourceSidebar } from "../components/SourceSidebar";
import { SourceModal } from "../components/SourceModal";
import { SongBar } from "../components/SongBar";
import { TrackReview } from "../components/TrackReview";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
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

  console.log({ selectedSources });

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
          {currentTrack && (
            <div className="h-min w-1/2 self-center">
              <TrackReview track={currentTrack} />
            </div>
          )}
          <PlaylistSidebar
            className="ml-auto self-center"
            playlist={selectedPlaylist}
            onClickChangePlaylist={() => setModalOpen(true)}
          />
        </div>
        <SongBar
          sources={selectedSources ?? []}
          onSelectTrack={(track) => setCurrentTrack(track)}
        />
      </main>
    </>
  );
};

export default Home;
