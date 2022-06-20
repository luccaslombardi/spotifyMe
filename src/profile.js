import { spotifyApi } from "./routes.js";

async function getUserPlaylists(userNameId, userName) {
  const data = await spotifyApi.getUserPlaylists(userNameId, {
    limit: 30,
  });
  const playlists = [];

  for (let i in data.body.items) {
    if (data.body.items[i].owner.display_name === userName) {
      playlists.push(data.body.items[i].name);
    }
  }

  return playlists;
}

export async function getProfile() {
  const data = await spotifyApi.getMe();
  const playlists = await getUserPlaylists(
    data.body.id,
    data.body.display_name
  );

  const profile = {
    name: data.body.display_name,
    image: data.body.images[0].url,
    playlists: playlists,
  };
  return profile;
}
