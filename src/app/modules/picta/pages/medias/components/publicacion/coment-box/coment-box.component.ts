import {Component, OnInit, input, output} from '@angular/core';
import {UserModel} from '../../../../../models/user.model';
import {Publication} from '../../../models/publicacion.model';
import { Canal } from '../../../../canal/models/canal.model';
import { ComentBoxItemComponent } from './coment-box-item/coment-box-item.component';


@Component({
    selector: 'app-coment-box',
    templateUrl: './coment-box.component.html',
    styleUrls: ['./coment-box.component.scss'],
    imports: [ComentBoxItemComponent]
})
export class ComentBoxComponent implements OnInit {
  readonly video = input<Publication>(undefined);
  readonly user = input<UserModel>(undefined);
  readonly canal = input<Canal>(undefined);
  readonly onUpdated = output();

  constructor() {
  }

  ngOnInit() {

  }

  actualizar() {
    this.onUpdated.emit();
  }
}
