import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { ComentBoxComponent } from '../../../medias/components/publicacion/coment-box/coment-box.component';
import { ComentFormComponent } from '../../../medias/components/publicacion/coment-form/coment-form.component';
import { ComentarioService } from '../../../medias/services/comentario.service';

@Component({
    selector: 'app-comments-sheet',
    imports: [MatIconModule, ComentBoxComponent, ComentFormComponent],
    templateUrl: './comments-sheet.component.html',
    styleUrl: './comments-sheet.component.scss'
})
export class CommentsSheetComponent {
   private bottomSheetRef = inject<MatBottomSheetRef<CommentsSheetComponent>>(MatBottomSheetRef);
   private comentarioService = inject(ComentarioService);
   data = inject(MAT_BOTTOM_SHEET_DATA);

   /** Inserted by Angular inject() migration for backwards compatibility */
   constructor(...args: unknown[]);


   constructor() {}


  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }

  loadComentarios() {
    this.comentarioService.comentariosByPost({ publicacion_id: this.data.video.id, page: 1, page_size: 10,}).subscribe((response: any) => {
      console.log('data: ',this.data.video.lista_comentarios);
      console.log('response: ',response);
      
      this.data.video.lista_comentarios.results = response.results;

      });
  }

}
