import { Component } from '@angular/core';
import { SideMenuHeaderComponent } from "./side-menu-header/side-menu-header.component";
import { SideMenuOptionsComponent } from "./side-menu-options/side-menu-options.component";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from 'rxjs';

@Component({
  selector: 'main-side-menu',
  imports: [SideMenuHeaderComponent, SideMenuOptionsComponent, RouterOutlet],
  templateUrl: './side-menu.html',
})
export class SideMenuComponent {
  hasContent = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });
  }

  checkRoute() {
    const url = this.router.url;

    // rutas que NO tienen contenido
    const emptyRoutes = [
      '/inicio',
      '/documentacion',
      '/soporte',
      '/pro-version'
    ];

    this.hasContent = !emptyRoutes.includes(url);
  }
}
