import {Directive, Injectable, output} from '@angular/core';

@Directive()
@Injectable({
  providedIn: 'root'
})
export class PanelCloseService {
  readonly closeAll = output<void>();

  constructor() {
  }

  closeAllPanel() {
    this.closeAll.emit();
  }
}
