import { Component, OnInit, inject } from '@angular/core';
import { SerieService } from '../../pages/categoria/services/serie.service';
import { UntypedFormControl } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { SerieListComponent } from '../../pages/categoria/components/serie-list/serie-list.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';


@Component({
    selector: 'app-estrenos',
    templateUrl: './estrenos.component.html',
    styleUrls: ['./estrenos.component.scss'],
    imports: [MatProgressSpinner, SerieListComponent, MatIcon]
})
export class EstrenosComponent implements OnInit {
  private serieService = inject(SerieService);


  loading = true;
  series: any;
  viewModeControl = new UntypedFormControl('card');

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() { }

  ngOnInit(): void {
    this.serieService.getSeries().subscribe((response: any) => { 
      this.series = this.filterEstrenos(response.results);
      this.loading = false;
    }) 
  }

  filterEstrenos(series: any){
    return series.filter((g: any) => g.cantidad_capitulos === 0 || g.cantidad_capitulos === 1);
  }

}
