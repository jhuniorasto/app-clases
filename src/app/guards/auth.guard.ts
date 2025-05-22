import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad, CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.authService.authInitialized$.pipe(
      // Esperar a que Firebase haya inicializado sesión
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
}
