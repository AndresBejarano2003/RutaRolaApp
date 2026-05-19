import { Component, input } from '@angular/core';

@Component({
  selector: 'gif-side-list-item',
  imports: [],
  templateUrl: './side-list-item.component.html',
})
export class SideListItemComponent {
  imgRuta = input.required<string>();
  imgTitle = input.required<string>();
}
