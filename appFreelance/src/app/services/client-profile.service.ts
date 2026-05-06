import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientProjectOffer {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
  status: 'open' | 'closed' | 'in_progress' | 'completed';
}

export interface freelancersRequest {
  id: string;
  freelancersId: string;
  freelancersName: string;
  freelancersAvatar: string;
  projectId: string;
  projectTitle: string;
  proposalText: string;
  proposalBudget: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ClientProfile {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    website?: string;
    bio?: string;
    avatar?: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'blocked';
  };
  stats: {
    totalSpent: number;
    activeProjects: number;
    completedProjects: number;
    freelancersRating: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private apiUrl = `${environment.apiUrl}/client`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère le profil complet du client connecté
   */
  getProfile(): Observable<ClientProfile> {
    return this.http.get<ClientProfile>(`${this.apiUrl}/profile`);
  }

  /**
   * Met à jour le profil du client
   */
  updateProfile(profileData: Partial<ClientProfile['user']>): Observable<ClientProfile> {
    return this.http.put<ClientProfile>(`${this.apiUrl}/profile`, profileData);
  }

  /**
   * Récupère les propositions de projets du client
   */
  getProjectOffers(): Observable<ClientProjectOffer[]> {
    return this.http.get<ClientProjectOffer[]>(`${this.apiUrl}/projects`);
  }

  /**
   * Crée une nouvelle proposition de projet
   */
  createProjectOffer(offerData: Omit<ClientProjectOffer, 'id' | 'status'>): Observable<ClientProjectOffer> {
    return this.http.post<ClientProjectOffer>(`${this.apiUrl}/projects`, offerData);
  }

  /**
   * Met à jour une proposition de projet
   */
  updateProjectOffer(projectId: string, offerData: Partial<ClientProjectOffer>): Observable<ClientProjectOffer> {
    return this.http.put<ClientProjectOffer>(`${this.apiUrl}/projects/${projectId}`, offerData);
  }

  /**
   * Ferme une proposition de projet
   */
  closeProjectOffer(projectId: string): Observable<ClientProjectOffer> {
    return this.http.patch<ClientProjectOffer>(`${this.apiUrl}/projects/${projectId}/close`, {});
  }

  /**
   * Récupère les demandes de freelancers (proposals)
   */
  getfreelancersRequests(): Observable<freelancersRequest[]> {
    return this.http.get<freelancersRequest[]>(`${this.apiUrl}/requests`);
  }

  /**
   * Accepte la demande d'un freelancers
   */
  acceptfreelancersRequest(requestId: string): Observable<freelancersRequest> {
    return this.http.patch<freelancersRequest>(`${this.apiUrl}/requests/${requestId}/accept`, {});
  }

  /**
   * Rejette la demande d'un freelancers
   */
  rejectfreelancersRequest(requestId: string): Observable<freelancersRequest> {
    return this.http.patch<freelancersRequest>(`${this.apiUrl}/requests/${requestId}/reject`, {});
  }

  /**
   * Récupère le nombre de messages non lus
   */
  getUnreadMessageCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/messages/unread-count`);
  }

  /**
   * Upload l'avatar du client
   */
  uploadAvatar(file: File): Observable<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatar: string }>(`${this.apiUrl}/avatar`, formData);
  }
}
