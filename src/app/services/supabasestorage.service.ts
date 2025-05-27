import { Injectable } from '@angular/core';
import { supabase } from '../../environments/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class SupabasestorageService {
  private bucket = 'clases';

  constructor() {}

  async subirArchivo(file: File): Promise<string | null> {
    const nombreArchivo = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(nombreArchivo, file);

    if (error) {
      console.error('Error al subir archivo:', error.message);
      return null;
    }

    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(nombreArchivo);

    return data?.publicUrl || null;
  }
}
