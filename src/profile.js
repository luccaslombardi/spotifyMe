import { spotifyApi } from "./routes.js";

async function getUserPlaylists(userName) {
  const data = await spotifyApi.getUserPlaylists(userName, {
    limit: 30,
  });
  const playlists = [];

  for (let i in data.body.items) {
    if (playlists[i].owner.display_name === "Luccas Lombardi") {
      playlists.push(playlists[i]);
    }
  }
  return playlists;
}

export async function getProfile() {
  const data = await spotifyApi.getMe();
  const playlists = await getUserPlaylists(data.body.id);

  const profile = {
    name: data.body.display_name,
    image: data.body.images[0].url,
    playlists: playlists,
  };

  return profile;
}
