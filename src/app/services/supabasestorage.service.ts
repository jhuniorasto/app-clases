import { Injectable } from '@angular/core';
import { supabase } from '../../environments/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class SupabasestorageService {
  private bucket = 'resources-appcursos';

  constructor() {}

  async subirArchivo(file: File): Promise<string | null> {
    const nombreArchivo = `${Date.now()}_${file.name}`;
    console.log('Subiendo archivo:', nombreArchivo);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.bucket)
      .upload(nombreArchivo, file);

    console.log('Resultado uploadData:', uploadData);
    console.log('Resultado uploadError:', uploadError);

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(nombreArchivo);

    console.log('Public data:', publicData);
    return publicData?.publicUrl || null;
  }
}
