
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'app-countdown-timer',
    imports: [],
    templateUrl: './countdown-timer.component.html',
    styleUrl: './countdown-timer.component.scss'
})
export class CountdownTimerComponent implements OnInit, OnDestroy{
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private countdownInterval: any;

  // Esto creará una fecha para el 14 de mayo a las 23:59:59 en tu zona horaria local
  deadline = new Date('2025-05-14T23:59:59').getTime();

  ngOnInit() {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown() {
    const now = new Date().getTime();
    const distance = this.deadline - now;
  
    if (distance <= 0) {
      this.handleExpired();
      return;
    }
  
    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }

  private handleExpired() {
    clearInterval(this.countdownInterval);
    this.days = 0;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
  }
}
