import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import fetchFromSpotify, { request } from "../../services/api";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  songs: any[] = []
  artists: any[] = []
  genre: any
  token: string = ''
  artistId: number = 0
  artistName: string = ''
  songCount = 1
  artistCount = 2

  correctGuesses: number = 0
  incorrectGuesses: number = 0
  isGameOver: boolean = false
  hasPreview: boolean = true
  message: string = ''

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') as string
    const storedSettings = localStorage.getItem('gameSettings')

  
    if (storedSettings) {
      const settings = JSON.parse(storedSettings)
      this.songCount = settings.songCount
      this.artistCount = settings.artistCount
      this.genre = settings.genre
    }
    (async () => {
      await this.fetchArtists(this.artistCount)
      await this.fetchSongs(this.songCount)
    })();
  }

  async fetchSongs(count: number): Promise<void> {
    const offset = Math.floor(Math.random() * 500) + 1
    const SEARCH_URL = `search?q=artist%3A${this.artistName}&type=track&limit=${count}&offset=${offset}`
    try {
      const response = await fetchFromSpotify({
        token: this.token,
        endpoint: SEARCH_URL,
      });
      if (response.tracks && response.tracks.items) {
          for(const key in response.tracks.items) {
            console.log('getting tracks: ' + response.tracks.items)
          }

          this.songs = response.tracks.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            sampleUrl: track.preview_url,
            correctArtistId: this.artistId,
          }));
        console.log(response);
        this.checkSongsArray(this.songs)
      }
    }
    catch (error) {
      console.error("Error fetching songs:", error)
    }
  }
  
  private checkSongsArray(checkSongs: any[]) {
    if(checkSongs.length === 0) {
      console.log('No Songs!')
      this.fetchSongs(this.songCount)
    }
  }

  async fetchArtists(count: number): Promise<void> {
    const offset = Math.floor(Math.random() * 1000) + 1
    const SEARCH_URL = `search?q=genre%3A${this.genre}&type=artist&limit=${count}&offset=${offset}`
    try {
      const response = await fetchFromSpotify({
        token: this.token,
        endpoint: SEARCH_URL,
      });
      if (response.artists && response.artists.items) {
        this.artists = response.artists.items.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          isCorrect: false,
          isClicked: false,
        }));
      }
      console.log(response);
      const randomIndex = Math.floor(Math.random() * this.artists.length)
      this.artistId = this.artists[randomIndex].id
      this.artistName = this.artists[randomIndex].name
    }
    catch (error) {
      console.error("Error fetching artists:", error)
    }
  };
  
  playSong(song: any): void {
    if(song.sampleUrl == null){
      console.log("no preview available")
      this.message = `No preview available for ${song.name}`
      this.hasPreview = false
    }
    else {
      console.log(`Playing sample for ${song.name}`);
      this.hasPreview = true
      const audio = document.getElementById('preview') as HTMLAudioElement;
      const audioSource = document.getElementById('audioSource') as HTMLSourceElement;
      if (audio && audioSource) {
        audioSource.src = song.sampleUrl;
        audio.load();
        audio.play();
    } else {
        console.error("Audio elements not found in the DOM");
    }
  }
}

  checkArtist(artist: any): void {
    if(this.songs.length === this.songCount) {
      if (this.songs[0].correctArtistId === artist.id) {
        artist.isCorrect = true
        this.correctGuesses++
      } else {
        artist.isClicked = true
        this.incorrectGuesses++
      }
      if (this.incorrectGuesses >= 3) {
        this.isGameOver = true
      }
    }

      (async () => {
        await this.fetchArtists(this.artistCount)
        await this.fetchSongs(this.songCount)
      })();
      const audio = document.getElementById('preview') as HTMLAudioElement
      const audioSource = document.getElementById('audioSource') as HTMLSourceElement

      if (audio && audioSource) {
          audio.pause()
          audio.currentTime = 0
          audioSource.src = ''
          audio.load()
      } else {
          console.error("Audio element not found in the DOM")
      }
    
  }
  goToConfiguration(): void {
    this.router.navigate(['/home'])
  }
}