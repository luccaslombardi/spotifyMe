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

      /*
  
        async function getUserPlaylists(userName) {
          const data = await spotifyApi.getUserPlaylists(userName)
        
          console.log("---------------+++++++++++++++++++++++++")
          let playlists = []
        
          for (let playlist of data.body.items) {
            console.log(playlist.name + " " + playlist.id)
            
            let tracks = await getPlaylistTracks(playlist.id, playlist.name);
            console.log(tracks);
        
            const tracksJSON = { tracks }
            let data = JSON.stringify(tracksJSON);
            writeFileSync(playlist.name+'.json', data);
          }
        }*/

      getProfile()
        .then((result) => {
          res.send(`
          <h1>${result.name}</h1>
          <img src="${result.image}" alt="Luccas" />
          `);
        })
        .catch((error) => res.send(error));

      /*
          //GET SONGS FROM PLAYLIST
        async function getPlaylistTracks(playlistId, playlistName) {
        
          const data = await spotifyApi.getPlaylistTracks(playlistId, {
            offset: 20,
            limit: 10,
            fields: 'items'
          })
        
          console.log('The playlist contains these tracks', data.body);
          console.log('The playlist contains these tracks: ', data.body.items[0].track);
          console.log("'" + playlistName + "'" + ' contains these tracks:');
          let tracks = [];
        
          for (let track_obj of data.body.items) {
            const track = track_obj.track
            tracks.push(track);
            console.log(track.name + " : " + track.artists[0].name)
          }
          
          console.log("---------------+++++++++++++++++++++++++")
          return tracks;
        }
  */
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

/*

      async function getUserPlaylists(userName) {
        const data = await spotifyApi.getUserPlaylists(userName)
      
        console.log("---------------+++++++++++++++++++++++++")
        let playlists = []
      
        for (let playlist of data.body.items) {
          console.log(playlist.name + " " + playlist.id)
          
          let tracks = await getPlaylistTracks(playlist.id, playlist.name);
          console.log(tracks);
      
          const tracksJSON = { tracks }
          let data = JSON.stringify(tracksJSON);
          writeFileSync(playlist.name+'.json', data);
        }
      }
      
      //GET SONGS FROM PLAYLIST
      async function getPlaylistTracks(playlistId, playlistName) {
      
        const data = await spotifyApi.getPlaylistTracks(playlistId, {
          offset: 20,
          limit: 10,
          fields: 'items'
        })
      
        console.log('The playlist contains these tracks', data.body);
        console.log('The playlist contains these tracks: ', data.body.items[0].track);
        console.log("'" + playlistName + "'" + ' contains these tracks:');
        let tracks = [];
      
        for (let track_obj of data.body.items) {
          const track = track_obj.track
          tracks.push(track);
          console.log(track.name + " : " + track.artists[0].name)
        }
        
        console.log("---------------+++++++++++++++++++++++++")
        return tracks;
      }

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      getMyData()
      */
