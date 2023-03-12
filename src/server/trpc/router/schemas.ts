import { z } from "zod";

export const ResourceResponse = z.object({
  href: z.string(),
  limit: z.number(),
  next: z.string().nullable(),
  offset: z.number(),
  // previous: null,
  total: z.number(),
});

export const TokenResponse = z.object({
  access_token: z.string(),
});

// https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist
export const PlaylistSchema = z.object({
  description: z.string().nullable(),
  external_urls: z.object({ spotify: z.string() }),
  href: z.string(),
  id: z.string(),
  snapshot_id: z.string(),
  images: z.array(
    z.object({
      url: z.string(),
      height: z.number().nullable(),
      width: z.number().nullable(),
    })
  ),
  owner: z.object({
    display_name: z.string(),
    id: z.string(),
    type: z.string(),
    uri: z.string(),
  }),
  name: z.string(),
  // tracks: z.object({href:z.string()}),
  type: z.literal("playlist"),
  // uri: z.string(),
});
// TODO: will probably remove passThrough eventually?
// .passthrough();

export const AlbumSchema = z.object({
  id: z.string(),
  images: z.array(
    z.object({
      url: z.string(),
      height: z.number().nullable(),
      width: z.number().nullable(),
    })
  ),
  name: z.string(),
  // tracks: z.object({href:z.string()}),
  type: z.literal("album"),
  // uri: z.string(),
});
// TODO: will probably remove passThrough eventually?
// .passthrough();

export type Album = z.infer<typeof AlbumSchema>;

export const AlbumResponse = ResourceResponse.extend({
  items: z.array(AlbumSchema),
});

export type Playlist = z.infer<typeof PlaylistSchema>;

export const UserPlaylistsResponse = ResourceResponse.extend({
  items: z.array(PlaylistSchema),
});

export const AlbumTracksSchema = z.object({
  id: z.string(),
  name: z.string(),
});
// .passthrough();

export type AlbumTrack = z.infer<typeof AlbumTracksSchema>;

export const HistoryItem = z.object({
  context: z.object({
    type: z.enum(["playlist", "album", "artist", "show"]),
    href: z.string(),
  }),
  track: AlbumTracksSchema,
});

export const HistoryResponse = z.object({
  items: z.array(HistoryItem),
});

// export const TracksRespone = ResourceResponse.extend({
//   items: z.array(TracksSchema),
// });

export const SearchResponse = z.object({
  playlists: UserPlaylistsResponse,
  albums: AlbumResponse,
});
// .passthrough();

export const ImageSchema = z.object({
  url: z.string(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export type Image = z.infer<typeof ImageSchema>;

const PlaylistTrackSchema = AlbumTracksSchema.extend({
  album: z.object({
    images: z.array(ImageSchema),
  }),
});

export type PlaylistTrack = z.infer<typeof PlaylistTrackSchema>;

export const PlaylistTracksResponse = ResourceResponse.extend({
  items: z.array(z.object({ track: PlaylistTrackSchema })),
});

export const AlbumTracksResponse = ResourceResponse.extend({
  items: z.array(AlbumTracksSchema),
});

export const SourceInputSchema = z.object({
  id: z.string(),
  type: z.enum([AlbumSchema.shape.type.value, PlaylistSchema.shape.type.value]),
});

// TODO: github issue? This only works if I put playlist first. If album is first it ends early and doesnt parse the other fields
export const TrackSchema = PlaylistTrackSchema.or(AlbumTracksSchema);

export type Track = z.infer<typeof TrackSchema>;

export const TracksResponse = ResourceResponse.extend({
  items: z.array(TrackSchema),
});

export const SourceSchema = PlaylistSchema.or(AlbumSchema);

export type Source = z.infer<typeof SourceSchema>;
