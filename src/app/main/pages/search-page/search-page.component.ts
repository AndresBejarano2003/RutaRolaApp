import { Component, inject, signal } from '@angular/core';
import { SideListComponent } from "../../components/side-list/side-list.component";
import { GifService } from '../../services/main.service';
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'app-search-page',
  imports: [SideListComponent],
  templateUrl: './search-page.component.html',
})
export default class SearchPageComponent {

  gifService = inject(GifService);
  main = signal<Gif[]>([]);

  onSearch(query: string): void {
    this.gifService.searchGifs(query).subscribe((resp) => {
      this.main.set(resp);
    });
  }
}
