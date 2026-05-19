import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, tap } from 'rxjs';

const GIF_KEY = 'searchHistory';

const loadFromLocalStorage: () => Record<string, Gif[]> = () => {
  const gifsFromLocalStorage = localStorage.getItem(GIF_KEY) ?? '{}';
  const main = JSON.parse(gifsFromLocalStorage);
  return main
};

interface LoginAccept {
  gSesId: string;
}

@Injectable({ providedIn: 'root' })
export class GifService {

  private http = inject(HttpClient);
  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(false);
  private trendingPage = signal(0);

  trendingGifGroup = computed<Gif[][]>(() => {
    const groups = [];
    for (let i = 0; i < this.trendingGifs().length; i += 3) {
      groups.push(this.trendingGifs().slice(i, i + 3));
    }
    return groups;
  });

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  saveGifsToLocalStorage = effect(() => {
    localStorage.setItem(GIF_KEY, JSON.stringify(this.searchHistory()));
  });

  constructor() {
    this.loadTrendingGifs();
  }

  loadTrendingGifs() {

    if (this.trendingGifsLoading()) return;

    this.trendingGifsLoading.set(true);


    this.http.get<GiphyResponse>(`${environment.giphyUrl}/main/trending`, {
      params: {
        api_key: environment.giphyApiKey,
        limit: '25',
        rating: 'g',
        offset: this.trendingPage() * 25,
      }
    }).subscribe((resp) => {
      const main = GifMapper.mapGiphyItemsTOGifArray(resp.data);
      this.trendingGifs.update((currentGifs) => [...currentGifs, ...main]);
      this.trendingGifsLoading.set(false);
      this.trendingPage.update((currentPage) => currentPage + 1);
    })


  }

  searchGifs(query: string): Observable<Gif[]> {

    return this.http.get<GiphyResponse>(`${environment.giphyUrl}/main/search`, {
      params: {
        q: query,
        api_key: environment.giphyApiKey,
        limit: '25',
        rating: 'g'
      }
    }).pipe(
      map(({ data }) => data),
      map((items) => GifMapper.mapGiphyItemsTOGifArray(items)),
      // Historial
      tap((items) => {
        this.searchHistory.update((history) => ({
          ...history,
          [query.toLocaleLowerCase()]: items,
        }));
      })
    );
  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }

  getValidarUsuario(username: any, password: any): string {
    if (username == "andresf.bejarano@gmail.com" && password == "!Andres") {
      return "AS456GDWEE3456FDKFPV09DN4IUT5M";
    } else {
      return "";
    }
  }

}
