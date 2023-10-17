import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import fetchFromSpotify, { request } from "../../services/api";

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  genres: String[] = ["House", "Alternative", "J-Rock", "R&B", "Pop"];
  selectedGenre: String = "";
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: String = "";
  selectedSongCount = 1;
  selectedArtistCount = 2;

  ngOnInit(): void {
    this.authLoading = true;
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString) || {};
      const storedSettings = localStorage.getItem('gameSettings');
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        this.authLoading = false;
        this.token = storedToken.value;
        this.loadGenres(this.token);
        if(storedSettings){
          const settings = JSON.parse(storedSettings);
          this.selectedGenre = settings.genre;
          this.selectedSongCount = settings.songCount;
          this.selectedArtistCount = settings.artistCount;
        }
        console.log("return");
        return;
      }
    }
    console.log("Sending request to AWS endpoint");
    request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      this.authLoading = false;
      this.token = newToken.value;
      this.loadGenres(newToken.value);
    });
  }

  loadGenres = async (t: any) => {
    this.configLoading = true;
    try {
    const response = await fetchFromSpotify({
      token: t,
      endpoint: "recommendations/available-genre-seeds",
    });
    console.log(response);
    this.genres = response.genres;
    this.configLoading = false;
  }
  catch (error) {
    console.error("Error fetching genres:", error);
  } finally {
    this.configLoading = false;
  }
  };

  setGenre(selectedGenre: any) {
    this.selectedGenre = selectedGenre;
    console.log(this.selectedGenre);
    console.log(TOKEN_KEY);
  }

  startGame(): void {
    const settings = {
      genre: this.selectedGenre,
      songCount: this.selectedSongCount,
      artistCount: this.selectedArtistCount
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings)); 
    console.log('starting');
    this.router.navigate(['/game'], { queryParams: { token: this.token } });
  }
}
