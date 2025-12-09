import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Router,
  Route,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, Observable, switchMap, take, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

// Verifica si el usuario tiene el rol requerido para acceder a la ruta
export class RoleGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const expectedRoles = route.data['roles'] as string[];

    return this.checkRoles(expectedRoles);
  }

  canLoad(route: Route): Observable<boolean | UrlTree> {
    const expectedRoles = route.data && (route.data['roles'] as string[]);
    return this.checkRoles(expectedRoles || []);
  }

  private checkRoles(expectedRoles: string[]): Observable<boolean | UrlTree> {
    return this.authService.authInitialized$.pipe(
      filter((init) => init), // Esperar a que esté inicializado
      take(1),
      switchMap(() => this.authService.rol$),
      filter((rol) => rol !== null), // Esperar a que el rol esté disponible
      take(1),
      timeout(5000),
      map((rol) => {
        if (rol && expectedRoles.includes(rol)) {
          return true;
        } else {
          console.warn('Acceso denegado: rol requerido no disponible', {
            rol,
            expectedRoles,
          });
          return this.router.createUrlTree(['/signin']);
        }
      })
    );
  }
}
