import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-myperfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './myperfil.component.html',
  styleUrl: './myperfil.component.css'
})
export class MyperfilComponent implements OnInit{

usuario: Usuario | null = null;
  cargando: boolean = true;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  async ngOnInit(): Promise<void> {
    const uid = await this.authService.getUserId();
    console.log('UID del usuario logeado:', uid);

    if (uid) {
      const data = await this.usuarioService.obtenerUsuarioPorUid(uid);
      console.log('Datos del usuario desde UsuarioService:', data);
      this.usuario = data;
    }

    this.cargando = false;
  }
}
