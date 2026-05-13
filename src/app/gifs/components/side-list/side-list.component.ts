import { Component, input, signal } from '@angular/core';
import { SideListItemComponent } from "./side-list-item/side-list-item.component";
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'gif-side-list',
  imports: [SideListItemComponent],
  templateUrl: './side-list.component.html',
})
export class SideListComponent {
  imgItems = input<Gif[]>();
}
