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
          <div>${result.topTracks}</div>
          `
          );
        })
        .catch((error) => res.send(error));

        spotifyApi.setRepeat('track')
  .then(function () {
    console.log('Repeat track.');
    }, function(err) {
    //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
    console.log('Something went wrong!', err);
  });
      /* Get a User’s Top Tracks*/
     /* spotifyApi.getMyTopTracks().then(
        function (data) {
          console.log("\nTop Tracks:\n");
          const topTracks = data.body.items;
          for (let i in topTracks) {
            console.log("Track: ", topTracks[i].name);
            console.log("Artists:");
            for (let y in topTracks[i].artists) {
              console.log(topTracks[i].artists[y].name);
            }
            console.log("---------------------");
          }
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );*/

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
