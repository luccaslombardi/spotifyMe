import express from "express";
import dotenv from "dotenv";
import SpotifyWebApi from "spotify-web-api-node";
import { getProfile } from "./profile.js";

dotenv.config();
export const routes = express.Router();
export const port = process.env.PORT;

const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];

export const spotifyApi = new SpotifyWebApi({
  redirectUri: `http://localhost:${port}/callback`,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

routes.get("/", (req, res) => {
  res.send("Hello World");
});

routes.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

routes.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expires_in = data.body["expires_in"];

      console.log(`Token expira em: ${expires_in}ms`);

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log("access_token:", access_token);
      console.log("refresh_token:", refresh_token);

      getProfile()
        .then((result) => {
          res.send(
            `
          <h1>${result.name}</h1>
          <img src="${result.image}" alt="Luccas" />
          <h2>Playlists</h2>
          <div>${result.playlists}</div>
          <h2>Top Tracks</h2>
          <img src="${result.topTracks.images[0]}" width=300 height=300 alt="Track1" />
          <h3>${result.topTracks.names[0]}</h3>
          <img src="${result.topTracks.images[1]}" width=300 height=300 alt="Track2" />
          <h3>${result.topTracks.names[1]}</h3>
          <img src="${result.topTracks.images[2]}" width=300 height=300 alt="Track3" />
          <h3>${result.topTracks.names[2]}</h3>
          `
          );
        })
        .catch((error) => res.send(error));

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body["access_token"];

        console.log("Token foi atualizado!");
        console.log("novo token:", access_token);

        spotifyApi.setAccessToken(access_token);
      }, (expires_in / 2) * 1000);
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});
