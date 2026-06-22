import { inject, Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {map} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ChatMessage} from '../models/chat-message';
import {Observable} from 'rxjs';
import { environment } from '../../../../environments/environment';

const natioUrl = `${environment.natioUrl}`;

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket = inject(Socket);
  private http = inject(HttpClient);

  public login(name, avatar, room) {
    this.socket.emit('login', {name, avatar, room});
  }

  getOnline(){
    return this.socket.fromEvent(`actualizar`).pipe(map((data: any) => {
      return data;
    }))
  }

  getChat(id){
    return this.socket.fromEvent(`message`).pipe(map((data: any) => {
      return data;
    }))
  }

  getChatMessages(id): Observable<ChatMessage[]>{
    return this.http.get<ChatMessage[]>(`${natioUrl}/chats/${id}`);
  }

  sendMessage(id, message: string){
    this.socket.emit(`message`, message);
  }
}
