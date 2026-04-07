import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FreelanceAuthHelper } from './freelance-auth-helper.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  private messageSubject = new Subject<any>();
  private conversationSubject = new Subject<any>();

  constructor(private auth: FreelanceAuthHelper) {}

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.auth.getToken();
    if (!token) {
      return;
    }

    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('message:new', (msg) => this.messageSubject.next(msg));
    this.socket.on('conversation:update', (payload) => this.conversationSubject.next(payload));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  joinOffer(offerId: string): void {
    this.socket?.emit('join_offer', { offerId });
  }

  leaveOffer(offerId: string): void {
    this.socket?.emit('leave_offer', { offerId });
  }

  sendMessage(payload: { receiverId: string; offerId: string; content: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Socket not connected');
        return;
      }

      this.socket.emit('message:send', payload, (response: any) => {
        if (response?.error) {
          reject(response.error);
          return;
        }
        resolve(response?.message || response);
      });
    });
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  onConversationUpdate(): Observable<any> {
    return this.conversationSubject.asObservable();
  }
}
