import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
  IonInput,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send, checkmarkDoneOutline, chatbubblesOutline } from 'ionicons/icons';
import { ApiService } from '../services/api.service';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    IonInput
  ]
})
export class ChatPage implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('ionContent') ionContent!: IonContent;

  offerId!: string;
  receiverId = '';
  messages: any[] = [];
  newMessage = '';
  isLoading = true;
  isSending = false;
  currentUserId = '';
  private messageSub?: Subscription;
  private shouldScroll = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private socket: SocketService,
    private toastCtrl: ToastController
  ) {
    addIcons({ send, checkmarkDoneOutline, chatbubblesOutline });
  }

  ngOnInit() {
    this.offerId = this.route.snapshot.paramMap.get('offerId') || this.route.snapshot.paramMap.get('id')!;
    this.receiverId = this.route.snapshot.paramMap.get('receiverId') || '';
    this.currentUserId = this.auth.getUserId();

    this.socket.connect();
    this.socket.joinOffer(this.offerId);
    this.messageSub = this.socket.onMessage().subscribe((msg) => this.handleIncomingMessage(msg));

    this.loadMessages();
    if (!this.receiverId) {
      this.api.getOffer(this.offerId).subscribe({
        next: (offer) => {
          if (this.auth.isClient()) {
            this.receiverId = offer?.acceptedfreelancersId || '';
          } else {
            this.receiverId = offer?.clientId || '';
          }
        },
        error: () => {}
      });
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) { this.ionContent?.scrollToBottom(300); this.shouldScroll = false; }
  }

  ngOnDestroy() {
    this.messageSub?.unsubscribe();
    this.socket.leaveOffer(this.offerId);
  }

  loadMessages() {
    this.isLoading = true;
    this.api.getMessages(this.offerId).subscribe({
      next: (res: any[]) => { this.messages = res; this.isLoading = false; this.shouldScroll = true; },
      error: async () => { this.isLoading = false; await this.toast('Failed to load messages', 'danger'); }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isSending) return;
    if (!this.receiverId) {
      this.toast('No recipient available yet', 'warning');
      return;
    }
    this.isSending = true;
    const content = this.newMessage.trim();
    this.newMessage = '';
    this.socket.sendMessage({ content, offerId: this.offerId, receiverId: this.receiverId })
      .then(() => { this.isSending = false; })
      .catch(async () => {
        this.isSending = false;
        this.newMessage = content;
        await this.toast('Failed to send', 'danger');
      });
  }

  onEnterKey(event: any) {
    if (event.key === 'Enter') { event.preventDefault(); this.sendMessage(); }
  }

  isMyMessage(msg: any): boolean { return msg.senderId === this.currentUserId; }

  isDifferentDay(msg: any, prev: any): boolean {
    if (!prev) return true;
    return new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
  }

  private handleIncomingMessage(msg: any) {
    if (!msg || msg.offerId !== this.offerId) return;
    if (this.messages.some(m => m._id === msg._id)) return;
    this.messages = [...this.messages, msg];
    this.shouldScroll = true;
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}