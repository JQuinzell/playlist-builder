import { PlaylistTrack, AlbumTrack } from "../server/trpc/router/schemas";

export async function getFullTrack(track: PlaylistTrack["track"] | AlbumTrack) {
  if ("album" in track) {
    const albumResponse = await fetch(
      `https://api.spotify.com/v1/albums/${id}?offset=${offset}&limit=${limit}`,
      params
    );
    const album = AlbumSchema.parse(await albumResponse.json());
    const data = AlbumTracksResponse.parse(json);
    const res: z.infer<typeof FullTrackResponse> = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        images: album.images,
      })),
      next: data.next ? cursor + 1 : undefined,
    };
    return res;
  } else {
    const data = PlaylistTracksResponse.parse(json);
    const res: z.infer<typeof FullTrackSchema> = {
      ...data,
      items: data.items.map(({ track }) => ({
        ...track,
        images: track.album.images,
      })),
      next: data.next ? cursor + 1 : undefined,
    };
    return res;
  }
}
