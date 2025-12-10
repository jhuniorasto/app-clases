import { Injectable } from '@angular/core';
import { supabase } from '../../environments/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class SupabasestorageService {
  private bucket = 'resources-appcursos';

  constructor() {}

  async subirArchivo(file: File): Promise<string> {
    const nombreArchivo = `${Date.now()}_${file.name}`;
    console.log('Subiendo archivo:', nombreArchivo);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.bucket)
      .upload(nombreArchivo, file);

    console.log('Resultado uploadData:', uploadData);
    console.log('Resultado uploadError:', uploadError);

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError);
      throw new Error(uploadError.message || 'Error desconocido al subir archivo');
    }

    // Intentar obtener public URL
    try {
      const publicResponse = supabase.storage.from(this.bucket).getPublicUrl(nombreArchivo);
      const url = (publicResponse as any)?.data?.publicUrl;
      if (url) {
        console.log('Public URL obtenida:', url);
        return url;
      }

      // Si no hay public URL, intentar crear signed URL de corta duración
      const { data: signedData, error: signedError } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(nombreArchivo, 60 * 60); // 1 hora

      if (signedError) {
        console.error('Error al crear signedUrl:', signedError);
        throw new Error(signedError.message || 'No se pudo generar URL pública ni firmada');
      }

      const signedUrl = (signedData as any)?.signedUrl;
      console.log('Signed URL obtenida:', signedUrl);
      return signedUrl || '';
    } catch (err: any) {
      console.error('Error procesando URLs del archivo:', err);
      throw new Error(err?.message || 'Error al procesar la URL del archivo');
    }
  }

  async verificarBucket(): Promise<{ ok: boolean; message?: string }> {
    try {
      // Intentar listar el contenido del bucket (1 elemento) para verificar permisos y existencia
      // La firma del SDK puede esperar un string path; usar list('') para listar desde la raíz
      const resp: any = await supabase.storage.from(this.bucket).list('');
      const data = resp?.data;
      const error = resp?.error;
      if (error) {
        console.error('Error listando bucket:', error);
        return { ok: false, message: error.message || JSON.stringify(error) };
      }
      // Si data es undefined o null, aún puede estar accesible; considerarlo OK
      return { ok: true };
    } catch (err: any) {
      console.error('Excepción verificando bucket:', err);
      return { ok: false, message: err?.message || String(err) };
    }
  }
}
