import { Component, Input, OnDestroy, OnChanges, SimpleChanges, ViewChild, ViewChildren, QueryList, ElementRef, AfterViewInit, NgZone, HostBinding } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TvcubanaScheduleService } from '../../services/tvcubana-schedule.service';
import { Subscription, interval } from 'rxjs';
import { parseISO } from 'date-fns';

@Component({
  selector: 'app-programacion-canal',
  templateUrl: './programacion-canal.component.html',
  styleUrls: ['./programacion-canal.component.scss'],
    animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      // allow overflow:auto on expanded so the inner container can scroll
      state('expanded', style({ height: '*', opacity: 1, overflow: 'auto' })),
      transition('collapsed => expanded', [animate('300ms cubic-bezier(0.2,0.8,0.2,1)')]),
      transition('expanded => collapsed', [animate('220ms cubic-bezier(0.4,0.0,0.2,1)')])
    ])
  ],
  standalone: true,
  imports: [MatCardModule, MatListModule, MatDividerModule, MatIconModule, MatButtonModule, DatePipe]
})
export class ProgramacionCanalComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input() idEprog: string | null = null;
  @Input() canalTitle: string | null = null;
  // collapsed by default: show only current program line until user expands
  collapsed = true;

  @HostBinding('class.expanded')
  get isExpanded() { return !this.collapsed; }

  schedule: any[] = [];
  currentProgramIndex = -1;
  loading = false;
  error: string | null = null;
  private scrollRetries = 0;
  announceText: string = '';

  // selection is driven by current time; items are not interactive

  private subs = new Subscription();
  @ViewChild('container', { static: false }) containerRef: ElementRef<HTMLDivElement> | null = null;
  @ViewChildren('progItem', { read: ElementRef }) itemRefs: QueryList<ElementRef<HTMLElement>> | null = null;

  constructor(private tvService: TvcubanaScheduleService, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // nothing here; scrolling happens after schedule loads
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idEprog'] && this.idEprog) {
      this.fetchSchedule(String(this.idEprog));
    }
  }

  private fetchSchedule(id: string) {
    this.loading = true;
    this.error = null;
    this.subs.add(
      this.tvService.getSchedule(id).subscribe({
        next: (res) => {
          try {
            const prog = res.programacion || [];
            const diaHoy = this.getSpanishWeekday();
            let entry = prog.find((p: any) => (p.dia || '').toLowerCase() === diaHoy);
            if (!entry) {
              const today = new Date();
              const isoDay = today.getDate();
              entry = prog.find((p: any) => p.fecha && p.fecha.indexOf(String(isoDay)) !== -1);
            }
            if (entry && entry.programas) {
              this.schedule = entry.programas.map((it: any) => ({
                ...it,
                start: it.eventInitialDateTime ? parseISO(it.eventInitialDateTime) : null,
                end: it.eventEndDateTime ? parseISO(it.eventEndDateTime) : null
              }));
              // sort by start time to ensure ordering
              this.schedule.sort((a: any, b: any) => {
                const ta = a.start ? a.start.getTime() : 0;
                const tb = b.start ? b.start.getTime() : 0;
                return ta - tb;
              });
            } else {
              this.schedule = [];
            }
            this.updateCurrentProgram();
            // refresh every 30s
            this.subs.add(interval(30 * 1000).subscribe(() => this.updateCurrentProgram()));
            // attempt scroll after render
            // Wait for the view to render, then try to scroll; keep `loading` true until
            // the first scroll attempt finishes (or retries exhausted) so the UI shows loading.
            this.scrollRetries = 0;
            setTimeout(() => this.scrollToCurrent(() => { this.loading = false; }, false), 300);
          } catch (e) {
            console.error(e);
            this.error = 'Error procesando la programación';
          }
          // loading is cleared by scroll callback
        },
        error: (err) => {
          console.error('Error fetching schedule', err);
          this.loading = false;
          this.error = 'No se pudo cargar la programación';
        }
      })
    );
  }

  private getSpanishWeekday(): string {
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    return dias[new Date().getDay()];
  }

  private updateCurrentProgram() {
    if (!this.schedule || !this.schedule.length) {
      this.currentProgramIndex = -1;
      return;
    }
    const now = new Date();
    let found = -1;
    for (let i = 0; i < this.schedule.length; i++) {
      const s = this.schedule[i];
      if (s.start && s.end) {
        if (now >= s.start && now < s.end) {
          found = i;
          break;
        }
      }
    }
    this.currentProgramIndex = found;
    // After determining current program, scroll it into view (top of container)
    // Only auto-scroll when expanded; otherwise delay until user expands.
    if (!this.collapsed) {
      // try scrolling using ViewChildren refs (more reliable)
      setTimeout(() => this.scrollToCurrentUsingItems(false), 0);
    }
  }
 
  // Scroll to current program. Accepts optional callback executed once scrolling
  // succeeded or retries are exhausted.
  private scrollToCurrent(done?: () => void, smooth: boolean = false) {
    try {
      if (!this.containerRef) {
        if (done) done();
        return;
      }
      const container = this.containerRef.nativeElement;
      if (this.currentProgramIndex === -1) {
        // default to top
        container.scrollTop = 0;
        if (done) done();
        return;
      }
      const child = container.querySelector(`[data-index="${this.currentProgramIndex}"]`) as HTMLElement | null;
      if (!child) {
        // If the child isn't rendered yet, retry a few times (gives Angular time to render)
        if (this.scrollRetries < 10) {
          this.scrollRetries++;
          const delay = 80 * this.scrollRetries; // increasing delay
          setTimeout(() => this.scrollToCurrent(done), delay);
          return;
        }
        // exhausted retries
        if (done) done();
        return;
      }

      let scrollContainer: HTMLElement = container;
      try {
        const ancestor = container.closest ? (container.closest('.programacion-card') as HTMLElement | null) : null;
        if (ancestor) {
          scrollContainer = ancestor;
        }
      } catch (e) {
        // ignore and use the original container
      }

      this.ngZone.runOutsideAngular(() => {
        try {
          const containerRect = scrollContainer.getBoundingClientRect();
          const childRect = child.getBoundingClientRect();
          // Check visibility: if child fully inside container, do nothing
          const isFullyVisible = childRect.top >= containerRect.top && childRect.bottom <= containerRect.bottom;
          if (isFullyVisible) {
            // focus the element if possible
            try { child.focus && child.focus(); } catch (e) {}
            if (done) done();
            return;
          }

          // Try native scrollIntoView for smooth scrolling (scrolls nearest scrollable ancestor)
          try {
            if (smooth && child.scrollIntoView) {
              child.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            } else if (child.scrollIntoView) {
              child.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
            } else {
              // Compute offset so child aligns to top of container
              const offset = childRect.top - containerRect.top;
              const target = scrollContainer.scrollTop + offset;
              if (typeof scrollContainer.scrollTo === 'function') {
                scrollContainer.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
              } else {
                scrollContainer.scrollTop = (child && child.offsetTop) ? child.offsetTop : 0;
              }
            }
          } catch (e) {
            // fallback to direct scrollTop
            scrollContainer.scrollTop = (child && child.offsetTop) ? child.offsetTop : 0;
          }
          // After scrolling, try to focus the child for keyboard users
          try { child.focus && child.focus(); } catch (e) {}
        } catch (e) {
          // fallback
          scrollContainer.scrollTop = (child && child.offsetTop) ? child.offsetTop : 0;
        }
        if (done) done();
      });
    } catch (e) {
      if (done) done();
    }
  }

  // Preferred scroll method using ViewChildren template refs. Retries if items
  // are not yet rendered.
  private scrollToCurrentUsingItems(smooth: boolean = false, attempt: number = 0) {
    try {
      if (this.currentProgramIndex === -1) return;
      const items = this.itemRefs ? this.itemRefs.toArray() : [];
      const elRef = items[this.currentProgramIndex];
      if (elRef && elRef.nativeElement) {
        // ensure ancestor scroll container is used by calling scrollIntoView on the item
        try {
          elRef.nativeElement.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end', inline: 'nearest' });
          try { elRef.nativeElement.focus && elRef.nativeElement.focus(); } catch (e) {}
          return;
        } catch (e) {
          // fallback to old method if scrollIntoView fails
        }
      }
      // retry a few times to allow rendering
      if (attempt < 8) {
        setTimeout(() => this.scrollToCurrentUsingItems(smooth, attempt + 1), 80 * (attempt + 1));
      }
    } catch (e) {
      // ignore
    }
  }

  

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    if (!this.collapsed) {
      // when expanding, scrolling will be attempted after the expand animation finishes
      // announce for screen readers
      try {
        const title = this.schedule && this.schedule[this.currentProgramIndex] ? this.schedule[this.currentProgramIndex].title : 'sin programa actual';
        this.announceText = `Mostrando cartelera — programa actual: ${title}`;
        setTimeout(() => { this.announceText = ''; }, 3500);
      } catch (e) {}
    }
  }

  // Called when the expand/collapse animation finishes. If we've just expanded,
  // ensure the current program is scrolled into view (smooth).
  onExpandCollapseDone(event: any) {
    try {
      if (event && event.toState === 'expanded') {
        // small delay to ensure DOM nodes are painted
        setTimeout(() => this.scrollToCurrentUsingItems(true), 20);
      }
    } catch (e) {
      // ignore
    }
  }
}
