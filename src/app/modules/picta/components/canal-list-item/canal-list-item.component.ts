import { Component, OnChanges, OnInit, SimpleChanges, input, inject } from '@angular/core';
import {SubscriptionService} from '../../../../services/subscription.service';
import {Canal} from '../../pages/canal/models/canal.model';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ShorterPipe } from '../../../../shorter.pipe';

@Component({
    selector: 'app-canal-list-item',
    templateUrl: './canal-list-item.component.html',
    styleUrls: ['./canal-list-item.component.scss'],
    imports: [NgOptimizedImage, RouterLink, ShorterPipe]
})
export class CanalListItemComponent implements OnInit, OnChanges {
  private subscriptionService = inject(SubscriptionService);

  readonly canales = input<Canal[]>(undefined);
  readonly mode = input('card');
  
  readonly canal = input<Canal>(undefined);
  readonly logged = input<boolean>(undefined);
  subscription = input<any>(undefined);
  subscribing: boolean;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  get subscribed(){
      return this.canal()?.suscripcion?.id;
  }

  ngOnInit() {
    this.checkSubscription();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkSubscription();
  }

  handleSubscribe() {
    this.subscribing = true;
    if (!this.subscribed) {
      this.subscriptionService.subscribe(this.canal().id).subscribe(res => {
        // this.subscribed = true;
        this.subscribing = false;
        this.subscription().set(res);
      });

    } else {
      this.subscriptionService.unsubscribe(this.subscription().id).subscribe(res => {
        // this.subscribed = false;
        this.subscribing = false;
      });
    }
  }

  private checkSubscription() {
    // this.subscribed = !!this.subscription;
  }
}
