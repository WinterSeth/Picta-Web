import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'unseen',
    standalone: true
})
export class UnseenPipe implements PipeTransform {

  transform(value: any[], args?: any): any {
    const unseen = value.filter(notificaction => notificaction.vista === false);
    return unseen.length;
  }

}
