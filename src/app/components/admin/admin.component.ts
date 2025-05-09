import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Firestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  profesores: any[] = [];

  imagenPorDefecto: string = 'https://cdn-icons-png.flaticon.com/512/4539/4539220.png';

  mostrarModal = false;

  profesorForm = {
    nombre: '',
    edad: null,
    curso: ''
  };

  constructor(private firestore: Firestore, private router: Router) {}

  ngOnInit() {
    this.obtenerProfesores();
  }

  async obtenerProfesores() {
    const profesoresRef = collection(this.firestore, 'profesores');
    const snapshot = await getDocs(profesoresRef);
    this.profesores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  onRedirectToSignIn() {
    this.router.navigate(['/sign-in']);
  }

  onRedirectToAdmin() {
    this.router.navigate(['/admin']);
  }

  // Mostrar el modal
  agregarProfesor() {
    this.mostrarModal = true;
  }

  // Confirmar desde el modal
  async confirmarAgregarProfesor() {
    const { nombre, edad, curso } = this.profesorForm;
  
    if (!nombre || !curso || isNaN(Number(edad))) {
      alert('Datos inválidos.');
      return;
    }
  
    const nuevoProfesor = {
      nombre,
      edad: Number(edad),
      curso,
      imagenUrl: this.imagenPorDefecto
    };
  
    // Cerrar el modal de inmediato para mejorar la experiencia del usuario
    this.cerrarModal();
  
    // Añadir el nuevo profesor localmente para que la UI se actualice rápidamente
    this.profesores.push({ ...nuevoProfesor, id: 'nuevo-id' });
  
    // Agregar el profesor a Firebase de forma asíncrona (sin bloquear la UI)
    const profesoresRef = collection(this.firestore, 'profesores');
    const docRef = await addDoc(profesoresRef, nuevoProfesor);
  
    // Después de que Firebase responda, actualizar el ID del profesor con el ID real
    const index = this.profesores.findIndex(p => p.id === 'nuevo-id');
    if (index !== -1) {
      this.profesores[index].id = docRef.id;
    }
  }


  cerrarModal() {
    this.mostrarModal = false;
    this.profesorForm = { nombre: '', edad: null, curso: '' };
  }

  async modificarProfesor(profesor: any) {
    const nombre = prompt('Nuevo nombre:', profesor.nombre);
    const edad = Number(prompt('Nueva edad:', profesor.edad));
    const curso = prompt('Nuevo curso:', profesor.curso);

    if (!nombre || !curso || isNaN(edad)) {
      alert('Datos inválidos.');
      return;
    }

    const index = this.profesores.findIndex(p => p.id === profesor.id);
    if (index !== -1) {
      this.profesores[index] = { ...this.profesores[index], nombre, edad, curso };
    }

    const profRef = doc(this.firestore, 'profesores', profesor.id);
    await updateDoc(profRef, { nombre, edad, curso });
  }

  async eliminarProfesor(id: string) {
    const confirmacion = confirm('¿Estás seguro de eliminar este profesor?');
    if (!confirmacion) return;

    this.profesores = this.profesores.filter(profesor => profesor.id !== id);

    const profRef = doc(this.firestore, 'profesores', id);
    await deleteDoc(profRef);
  }

}
