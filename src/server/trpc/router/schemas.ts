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
export const PlaylistSchema = z
  .object({
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
  })
  // TODO: will probably remove passThrough eventually?
  .passthrough();

export const AlbumSchema = z
  .object({
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
  })
  // TODO: will probably remove passThrough eventually?
  .passthrough();

export const AlbumResponse = ResourceResponse.extend({
  items: z.array(AlbumSchema),
});

export type Playlist = z.infer<typeof PlaylistSchema>;

export const UserPlaylistsResponse = ResourceResponse.extend({
  items: z.array(PlaylistSchema),
});

export const TracksSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

export const HistoryItem = z.object({
  context: z.object({
    type: z.enum(["playlist", "album", "artist", "show"]),
    href: z.string(),
  }),
  track: TracksSchema,
});

export const HistoryResponse = z.object({
  items: z.array(HistoryItem),
});

// export const TracksRespone = ResourceResponse.extend({
//   items: z.array(TracksSchema),
// });

export const SearchResponse = z
  .object({
    playlists: UserPlaylistsResponse,
    albums: AlbumResponse,
  })
  .passthrough();

export const PlaylistTracksResponse = ResourceResponse.extend({
  items: z.array(
    z.object({
      track: TracksSchema.extend({
        album: z.object({
          images: z.array(
            z.object({
              url: z.string(),
              height: z.number().nullable(),
              width: z.number().nullable(),
            })
          ),
        }),
      }),
    })
  ),
});

export const AlbumTracksResponse = ResourceResponse.extend({
  items: z.array(TracksSchema),
});

export const SourceSchema = z.object({
  id: z.string(),
  type: z.enum([AlbumSchema.shape.type.value, PlaylistSchema.shape.type.value]),
});
