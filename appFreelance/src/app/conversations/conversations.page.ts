import { Component, OnInit } from '@angular/core';
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
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';

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
    SideBarComponent
  ]
})
export class ConversationsPage implements OnInit {
  conversations: any[] = [];
  isLoading = true;

  constructor(
    private api: ApiService,
    private auth: FreelanceAuthHelper,
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
}
