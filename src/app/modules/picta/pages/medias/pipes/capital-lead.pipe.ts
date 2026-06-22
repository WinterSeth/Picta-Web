import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'capitalLead',
    standalone: true
})
export class CapitalLeadPipe implements PipeTransform {

  transform(value: string, args?: any): any {
    return value[0].toUpperCase();
  }

}
