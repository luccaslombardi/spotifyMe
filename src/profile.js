import { spotifyApi } from "./routes.js";

async function getUserPlaylists(userNameId, userName) {
  const data = await spotifyApi.getUserPlaylists(userNameId, {
    limit: 50,
  });
  const playlists = [];

  for (let i in data.body.items) {
   if (data.body.items[i].owner.display_name === userName) {
      playlists.push(data.body.items[i].name);
    }
  }

  return playlists;
}

async function getTopTracks() {
  const data = await spotifyApi.getMyTopTracks({limit:3})
  const topTracks = []
  for (let i in data.body.items){
   topTracks.push(data.body.items[i].name)
  }

  return topTracks
}

export async function getProfile() {
  const data = await spotifyApi.getMe();
  const playlists = await getUserPlaylists(
    data.body.id,
    data.body.display_name
  );
  const topTracks = await getTopTracks()

  const profile = {
    name: data.body.display_name,
    image: data.body.images[0].url,
    playlists: playlists,
    topTracks: topTracks
  };
  return profile;
}
