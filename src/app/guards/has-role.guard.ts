import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, Observable, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const expectedRoles = route.data['roles'] as string[];

    return this.authService.authInitialized$.pipe(
      filter((init) => init), // Esperar a que esté inicializado
      take(1),
      switchMap(() => this.authService.rol$),
      take(1),
      map((rol) => {
        if (rol && expectedRoles.includes(rol)) {
          return true;
        } else {
          alert('No tienes el rol necesario para acceder a esta página.');
          return this.router.createUrlTree(['/home']); // o /home
        }
      })
    );
  }
}
