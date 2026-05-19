import { Component, OnInit, input, output, inject, PLATFORM_ID, AfterViewChecked, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-cine-playlist',
    templateUrl: './cine-playlist.component.html',
    styleUrls: ['./cine-playlist.component.scss'],
    standalone: true,
    imports: [MatIcon, MatTooltip]
})
export class CinePlaylistComponent implements OnInit, AfterViewChecked {
    readonly playlist = input<any>(undefined);
    readonly currentVideoId = input<number | string | undefined>(undefined);
    readonly close = output<void>();
    readonly selectVideo = output<any>();
    readonly downloadVideo = output<any>();

    platformId = inject(PLATFORM_ID);
    
    private hasScrolled = false;
    private lastVideoId: number | string | undefined;

    // Computed para el índice actual
    readonly currentIndex = computed(() => {
        const currentId = this.currentVideoId();
        return this.playlistItems.findIndex(item => item.id === currentId);
    });

    // Progress computado
    readonly progressPercent = computed(() => {
        const total = this.playlistItems.length;
        if (total === 0) return 0;
        const current = this.currentIndex();
        if (current < 0) return 0;
        return Math.round(((current + 1) / total) * 100);
    });

    ngOnInit() {
        this.hasScrolled = false;
    }

    ngAfterViewChecked() {
        if (!isPlatformBrowser(this.platformId)) return;
        
        const currentId = this.currentVideoId();
        if (currentId && currentId !== this.lastVideoId) {
            this.lastVideoId = currentId;
            this.scrollToActiveItem();
        }
    }

    onClose() {
        this.close.emit();
    }

    onSelectVideo(item: any) {
        this.selectVideo.emit(item);
        this.onClose();
    }

    onDownload(item: any, event: Event) {
        event.stopPropagation();
        this.downloadVideo.emit(item);
    }

    isActive(item: any): boolean {
        return item.id === this.currentVideoId();
    }

    isViewed(item: any): boolean {
        // Por ahora retorna false, podría extenderse para marcar videos vistos
        return false;
    }

    get playlistItems() {
        return this.playlist()?.publicacion || this.playlist()?.publicaciones || [];
    }

    private scrollToActiveItem() {
        if (this.hasScrolled) return;
        
        setTimeout(() => {
            const container = document.querySelector('.cine-playlist-content') as HTMLElement;
            const activeItem = document.querySelector('.cine-playlist-item.active') as HTMLElement;
            
            if (container && activeItem) {
                const containerHeight = container.clientHeight;
                const itemHeight = activeItem.clientHeight;
                const itemTop = activeItem.offsetTop;
                
                const targetScroll = itemTop - (containerHeight / 2) + (itemHeight / 2);
                const safeScroll = Math.max(0, targetScroll);
                
                this.animateScroll(container, container.scrollTop, safeScroll, 500);
                
                this.hasScrolled = true;
            }
        }, 350);
    }
    
    private animateScroll(element: HTMLElement, from: number, to: number, duration: number) {
        const startTime = performance.now();
        
        // Easing: ease-out-quart para deceleración natural
        const easeOutQuart = (t: number): number => {
            return 1 - Math.pow(1 - t, 4);
        };
        
        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutQuart(progress);
            
            element.scrollTop = from + (to - from) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}