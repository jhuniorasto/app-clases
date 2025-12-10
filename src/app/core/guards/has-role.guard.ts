import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  CanMatch,
  Router,
  Route,
  UrlTree,
  UrlSegment,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, Observable, switchMap, take, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
/**
 * Verifica si el usuario tiene el rol requerido para acceder a la ruta
 * Usa canMatch para evaluación temprana en lazy loading
 */
export class RoleGuard implements CanActivate, CanLoad, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const expectedRoles = route.data['roles'] as string[];
    return this.checkRoles(expectedRoles);
  }

  canLoad(route: Route): Observable<boolean | UrlTree> {
    const expectedRoles = route.data && (route.data['roles'] as string[]);
    return this.checkRoles(expectedRoles || []);
  }

  canMatch(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean | UrlTree> {
    const expectedRoles = route.data && (route.data['roles'] as string[]);
    return this.checkRoles(expectedRoles || []);
  }

  private checkRoles(expectedRoles: string[]): Observable<boolean | UrlTree> {
    return this.authService.authInitialized$.pipe(
      filter((init) => init),
      take(1),
      switchMap(() => this.authService.rol$),
      filter((rol) => rol !== null),
      take(1),
      timeout(5000),
      map((rol) => {
        if (rol && expectedRoles.includes(rol)) {
          return true;
        } else {
          console.warn('⚠️ Acceso denegado: rol requerido no disponible', {
            rol,
            expectedRoles,
          });
          return this.router.createUrlTree(['/forbidden']);
        }
      })
    );
  }
}
