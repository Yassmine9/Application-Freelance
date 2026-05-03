import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, chevronForwardOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToolBarComponent } from '../components/Tool-bar/toolbar.component';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.page.html',
  styleUrls: ['./conversations.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonBadge, IonIcon,
    IonSpinner,
    ToolBarComponent
  ]
})
export class ConversationsPage implements OnInit, OnDestroy {
  conversations: any[] = [];
  isLoading = true;
  private convoSub?: Subscription;

  constructor(
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private socket: SocketService,
    private router: Router
  ) {
    addIcons({ chatbubblesOutline, chevronForwardOutline });
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadConversations();
    this.socket.connect();
    this.convoSub = this.socket.onConversationUpdate().subscribe((update) => {
      if (update?.offerId) {
        this.upsertConversation(update);
      }
    });
  }

  ngOnDestroy() {
    this.convoSub?.unsubscribe();
  }

  loadConversations() {
    this.isLoading = true;
    this.api.getConversations().subscribe({
      next: (res) => {
        this.conversations = res || [];
        this.isLoading = false;
      },
      error: () => {
        this.conversations = [];
        this.isLoading = false;
      }
    });
  }

  getLastPreview(convo: any): string {
    if (convo?.lastMessage?.content) return convo.lastMessage.content;
    if (!convo?.otherUserId) return 'Chat available once a freelancer is accepted.';
    return 'No messages yet.';
  }

  getInitials(label: string): string {
    if (!label) return '??';
    return label
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private upsertConversation(update: any) {
    const idx = this.conversations.findIndex(c => c.offerId === update.offerId);
    if (idx >= 0) {
      this.conversations[idx] = { ...this.conversations[idx], ...update };
    } else {
      this.conversations.unshift(update);
    }

    this.conversations.sort((a, b) => {
      const aTime = a?.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b?.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }
}
