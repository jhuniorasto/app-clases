import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
//Verifica si el usuario esta autenticado antes de cargar el módulo
export class AuthGuard implements CanLoad, CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.authService.authInitialized$.pipe( //authInitialized$ es un observable que indica si Firebase ya terminó de verificar si hay sesión.
      filter((initialized) => initialized), //  Espera a que authInitialized$ sea true
      take(1), // take(1) se asegura de que tomamos solo un valor y terminamos.
      switchMap(() =>
        this.authService.isLoggedIn$.pipe( // isLoggedIn$ es un observable que indica si el usuario está autenticado
          take(1),
          map((isLoggedIn) =>
            isLoggedIn ? true : this.router.createUrlTree(['/signin']) // Si el usuario no está autenticado, redirige a la página de inicio de sesión
          )
        )
      )
    );
  }

  canLoad(): Observable<boolean | UrlTree> { // Método canLoad se usa para proteger la carga de módulos
    return this.checkAuth();
  }

  canActivate(): Observable<boolean | UrlTree> { // Método canActivate se usa para proteger las rutas
    return this.checkAuth();
  }
}
