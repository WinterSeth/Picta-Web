import { Component, OnInit, inject } from '@angular/core';
import { PublicationService } from '../../pages/medias/services/publication-service';
import { Publication } from '../../pages/medias/models/publicacion.model';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Dir } from '@angular/cdk/bidi';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MyCarouseloComponent } from '../common-components/components/my-carousel-o/my-carouselo.component';

@Component({
    selector: 'app-populares',
    templateUrl: './populares.component.html',
    styleUrls: ['./populares.component.scss'],
    providers: [DatePipe],
    imports: [MatProgressSpinner, Dir, RouterLink, MyCarouseloComponent]
})
export class PopularesComponent implements OnInit {
  private publicationService = inject(PublicationService);
  private datePipe = inject(DatePipe);
  private title = inject(Title);


  loading = true;
  currentDate;
  weekAgo;
  monthAgo;

  pais: string = 'Cuba';

  popular: Publication[] = [];
  popularMovie: Publication[] = [];
  popularAnime: Publication[] = [];
  popularSerie: Publication[] = [];
  popularLikeMovie: Publication[] = [];
  popularLikeSerie: Publication[] = [];
  popularCubanMovie: Publication[] = [];
  popularCubanSerie: Publication[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.title.setTitle(`Tendencias - Picta`);
    const now = new Date();
    this.currentDate = this.datePipe.transform(now, 'yyyy-MM-dd');
    this.weekAgo = this.datePipe.transform(
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd',
    );
    this.monthAgo = this.datePipe.transform(
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd',
    );
    if(this.loading = true){
      this.loadSesions(this.currentDate, this.weekAgo, this.monthAgo);
    }
  }

  loadSesions(currentDate, weekAgo, monthAgo){
    this.publicationService.getByCubanMovie().subscribe((response: any) => {
      this.popularCubanMovie = response;
    });
    this.publicationService.getByCubanSerie().subscribe((response: any) => {
      this.popularCubanSerie = response;
    });
    this.publicationService.getByLastWeek(currentDate, weekAgo, monthAgo).subscribe((response: any) => {
      this.popular = response;
    });
    this.publicationService.getByMovieLastTime(currentDate, weekAgo).subscribe((response: any) => {
      this.popularMovie = response;
    });
    this.publicationService.getByAnimeLastTime(currentDate, weekAgo).subscribe((response: any) => {
      this.popularAnime = response;
    });
    this.publicationService.getByLikesLastTimeSerie(currentDate, weekAgo).subscribe((response: any) => {
      this.popularLikeSerie = response;
      this.loading = false;
    });
  }
}
