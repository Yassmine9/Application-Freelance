import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FeedbackPayload {
  subject: string;
  message: string;
  contactEmail?: string;
}

export interface FeedbackResponse {
  message: string;
  feedbackId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  sendFeedback(payload: FeedbackPayload): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(`${this.apiUrl}/feedback`, payload);
  }
}
