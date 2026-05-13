import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { GifService } from '../../services/gifs.service';
import { SideListComponent } from "../../components/side-list/side-list.component";

@Component({
  selector: 'app-gif-history',
  imports: [SideListComponent],
  templateUrl: './gif-history.component.html',
})
export default class GifHistoryComponent {

  GifService = inject(GifService);

  query = toSignal(
    inject(ActivatedRoute).params.pipe(
      map(params => params['query']))
  );

  gifsByKey = computed(() => this.GifService.getHistoryGifs(this.query()));
}
