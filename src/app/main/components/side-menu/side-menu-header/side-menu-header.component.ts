import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '@environments/environment';

@Component({
  selector: 'main-side-menu-header',
  imports: [RouterLink],
  templateUrl: './side-menu-header.component.html',
})
export class SideMenuHeaderComponent {
  envs = environment;
}
