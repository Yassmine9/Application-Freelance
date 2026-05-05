import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class freelancersProfileService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers() {
    const token =localStorage.getItem('auth_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.base}/freelancers/myprofile`, this.headers());
  }

  getfreelancersProfile(freelancersId: string): Observable<any> {
    return this.http.get(`${this.base}/freelancers/${freelancersId}`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.base}/freelancers/profile`, data, this.headers());
  }

  uploadCV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    const token = localStorage.getItem('auth_token');
    return this.http.post(`${this.base}/freelancers/profile/cv`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
    downloadCv(): Observable<Blob> {
      console.log('Download CV clicked!');
    return this.http.get(`${this.base}/freelancer/profile/cv/download`, 
    {responseType: 'blob'});
  }
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('auth_token');
    return this.http.post(`${this.base}/freelancers/profile/avatar`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}