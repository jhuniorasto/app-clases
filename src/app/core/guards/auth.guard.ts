import { Injectable } from '@angular/core';
import {
  CanLoad,
  CanActivate,
  CanMatch,
  Router,
  UrlTree,
  Route,
  UrlSegment,
} from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Verifica si el usuario está autenticado antes de activar/cargar rutas
 * Usa canMatch para lazy loading más eficiente
 */
export class AuthGuard implements CanLoad, CanActivate, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.authService.authInitialized$.pipe(
      filter((initialized) => initialized),
      take(1),
      switchMap(() =>
        this.authService.isLoggedIn$.pipe(
          take(1),
          map((isLoggedIn) =>
            isLoggedIn ? true : this.router.createUrlTree(['/signin'])
          )
        )
      )
    );
  }

  canLoad(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canMatch(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }
}
