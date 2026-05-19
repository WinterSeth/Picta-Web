import { Component } from '@angular/core';
import { FaqSectionComponent } from '../../components/landing/faq-section/faq-section.component';
import { ReasonsToJoinSectionComponent } from '../../components/landing/reasons-to-join-section/reasons-to-join-section.component';
import { HeroSectionComponent } from '../../components/landing/hero-section/hero-section.component';
import { TrendingSectionComponent } from '../../components/landing/trending-section/trending-section.component';
import { FaqComponent } from "../faq/components/faq/faq.component";

@Component({
    selector: 'app-landing',
    imports: [ReasonsToJoinSectionComponent, HeroSectionComponent, TrendingSectionComponent, FaqSectionComponent],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

}
