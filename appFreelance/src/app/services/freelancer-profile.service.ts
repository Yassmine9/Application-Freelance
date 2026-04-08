import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FreelancerProfileService {

  private base = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  private headers() {
    const token =localStorage.getItem('auth_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.base}/freelancer/myprofile`, this.headers());
  }

  getFreelancerProfile(freelancerId: string): Observable<any> {
    return this.http.get(`${this.base}/freelancer/${freelancerId}`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.base}/freelancer/profile`, data, this.headers());
  }

  uploadCV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    const token = localStorage.getItem('auth_token');
    return this.http.post(`${this.base}/freelancer/profile/cv`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('auth_token');
    return this.http.post(`${this.base}/freelancer/profile/avatar`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}