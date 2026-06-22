import {AfterViewInit, Component, OnInit, ViewChild, input} from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import {ChatService} from '../../services/chat.service';
import {ChatMessage} from '../../models/chat-message';
import {finalize, tap} from 'rxjs';
import {AuthService} from '../../../../services/auth.service';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UpperCasePipe, NgOptimizedImage } from '@angular/common';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    imports: [MatAccordion, NgOptimizedImage, MatExpansionPanel, MatExpansionPanelHeader, MatProgressSpinner, MatIcon, MatIconButton, MatTooltip, MatMenuTrigger, MatMenu, MatFormField, MatInput, ReactiveFormsModule, UpperCasePipe]
})
export class ChatComponent implements OnInit, AfterViewInit {
  readonly id = input(undefined);
  messages: ChatMessage [];
  online: any;
  messageInput = new UntypedFormControl('');
  loadingMessages = true;
  user;
  themeEmoji = {
    martShowHeader: true,
    martShowFooter: false,
    martHeaderPadding: {x: '0', y: '0'},
    martFooterPadding: {x: '0', y: '0'},
    martHeaderFontSize: '14px',
    martHeaderBG: '#e3e7e8',
    martFooterBG: '#e3e7e8',
    martBG: '#ebeff2',
    martCategoryColor: '#94a0a6',
    martCategoryColorActive: '#455a64',
    martActiveCategoryIndicatorColor: '#00897b',
    martEmojiFontSize: '150%',
    martCategoryFontSize: '20px',
    martBorderRadius: '5px',
    martActiveCategoryIndicatorHeight: '4px',
    martEmojiPadding: {x: '40px', y: '40px'}
  };
  toggle = false;

  constructor(
    private chatService: ChatService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.chatService.getOnline()
      .subscribe(data => {
        this.online = data;
    });
    this.authService.user$.subscribe(user => {
      //console.log(user);
      if (user) {
        this.user = user;
        this.chatService.login(user.username, user.avatar, this.id());
        this.messageInput.enable();
      } else {
        this.messageInput.disable();
        delete this.user;
      }
    });
    this.loadMessages();
  }

  send(inputRef) {
    if (!this.messageInput.value) {
      return;
    }
    this.messageInput.disable();
    this.chatService.sendMessage(this.id(), this.messageInput.value);
    this.messageInput.reset('');
    this.messageInput.enable();
    setTimeout(() => {
/*       this.componentRef.directiveRef.scrollToBottom(0, 300);
 */      inputRef.focus();
    }, 150)
  }

  loadPreviousMessages() {
    this.loadingMessages = true;
    setTimeout(() => {
      this.loadingMessages = false
    }, 3000);
  }

  ngAfterViewInit(): void {
    /*this.componentRef.psYReachStart.subscribe(value => {
      this.loadPreviousMessages();
    })*/
  }

  donate() {

  }

  private loadMessages() {
    this.loadingMessages = true;
    this.chatService.getChatMessages(this.id())
      .pipe(
        finalize(() => this.loadingMessages = false)
      )
      .subscribe(data => {
        this.messages = data;
        this.scrollToBottom();
        this.listenMessages();
      });
  }

  private listenMessages() {
    this.chatService.getChat(this.id())
      .pipe(
        tap(msg => {
          this.messages.push(msg);
          this.scrollToBottom();
        })
      ).subscribe();
  }

  private scrollToBottom() {
    setTimeout(() => {
/*       this.componentRef.directiveRef.scrollToBottom(0, 300);
 */    }, 150)
  }

  emojiClicked(emoji: any) {
    if (emoji && emoji.char) {
      this.messageInput.setValue(this.messageInput.value + emoji.char);

    }
  }
}
