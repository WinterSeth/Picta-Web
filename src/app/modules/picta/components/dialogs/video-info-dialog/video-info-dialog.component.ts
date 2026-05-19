import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage, DecimalPipe } from '@angular/common';
import { Publication } from '../../../pages/medias/models/publicacion.model';
import { RouterLink } from '@angular/router';

interface VideoInfoData {
  video: Publication;
}

@Component({
  selector: 'app-video-info-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-info-dialog.component.html',
  styleUrls: ['./video-info-dialog.component.scss'],
  imports: [
    MatDialogContent, 
    MatDialogActions, 
    MatDialogClose,
    MatButton, 
    MatIcon, 
    NgOptimizedImage, 
    DecimalPipe,
    RouterLink
  ]
})
export class VideoInfoDialogComponent implements OnInit {
  data = inject<VideoInfoData>(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<VideoInfoDialogComponent>>(MatDialogRef);

  // Signals para la información del video
  video = signal<Publication>(this.data?.video);
  
  // Determinar tipo de contenido
  isMovie = computed(() => {
    const v = this.video();
    return v?.categoria?.tipologia?.modelo === 'pelicula';
  });

  isSeries = computed(() => {
    const v = this.video();
    return v?.categoria?.tipologia?.modelo === 'capitulo' || v?.categoria?.capitulo;
  });

  isLive = computed(() => {
    const v = this.video();
    return v?.categoria?.tipologia?.modelo === 'live' || v?.tipo === 'live';
  });

  // Extraer información de la película
  movieInfo = computed(() => {
    const v = this.video();
    if (!v?.categoria?.pelicula) return null;
    
    const pelicula = v.categoria.pelicula;
    return {
      year: pelicula.ano || v.ano || '',
      country: pelicula.pais || '',
      genres: pelicula.genero?.map(g => g.nombre).join(', ') || '',
      directors: pelicula.director?.map(d => d.nombre).join(', ') || '',
      actors: pelicula.reparto?.slice(0, 5).map(a => a.nombre).join(', ') || '',
      synopsis: v.descripcion || ''
    };
  });

  // Extraer información de la serie
  seriesInfo = computed(() => {
    const v = this.video();
    // La ruta correcta es: video.categoria.capitulo.temporada.serie
    const serie = v?.categoria?.capitulo?.temporada?.serie;
    if (!serie) return null;
    
    return {
      name: serie.nombre || '',
      year: serie.ano?.toString() || '',
      country: serie.pais || '',
      genres: serie.genero?.map(g => g.nombre).join(', ') || '',
      directors: serie.director?.map(d => d.nombre).join(', ') || '',
      actors: serie.reparto?.slice(0, 5).map(a => a.nombre).join(', ') || '',
      synopsis: serie.sinopsis || v.descripcion || '',
      totalSeasons: serie.cantidad_temporadas || v.cantidad_temporadas || 0,
      totalEpisodes: serie.cantidad_capitulos || v.cantidad_capitulos || 0,
      currentSeason: v.categoria?.capitulo?.temporada?.nombre || '',
      currentEpisode: v.categoria?.capitulo?.numero || 0
    };
  });

  // Canal
  canal = computed(() => this.video()?.canal);

  // Imagen del póster (vertical para series y películas)
  posterImage = computed(() => {
    const v = this.video();
    if (!v?.url_imagen) return '';
    
    // Para series, usar imagen_secundaria de la serie
    if (this.isSeries()) {
      const serie = v.categoria?.capitulo?.temporada?.serie;
      const img = serie?.imagen_secundaria || v.url_imagen;
      return img ? img + '_400x600' : '';
    }
    
    // Para películas, usar imagen_secundaria de la película
    if (this.isMovie()) {
      const pelicula = v.categoria?.pelicula;
      const img = pelicula?.imagen_secundaria || v.url_imagen;
      return img ? img + '_400x600' : '';
    }
    
    // Para otros tipos, usar imagen normal
    return v.url_imagen + '_400x600';
  });

  // Método para obtener el nombre de la serie
  getSeriesSlug(): string {
    const name = this.seriesInfo()?.name;
    return name || '';
  }

  ngOnInit() {
  }
}