import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';

interface Estadisticas {
  totalEstudiantes: number;
  totalDocentes: number;
  totalCursos: number;
  totalInscripciones: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  estadisticas: Estadisticas | null = null;
  cargando: boolean = true;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarEstadisticas();
  }

  async cargarEstadisticas(): Promise<void> {
    try {
      this.cargando = true;
      this.estadisticas = await this.adminService.obtenerEstadisticas();
      this.error = null;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      this.error = 'Error al cargar las estadísticas';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las estadísticas',
      });
    } finally {
      this.cargando = false;
    }
  }
}
