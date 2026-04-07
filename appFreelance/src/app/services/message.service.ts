import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  apiUrl = "http://127.0.0.1:5000/messages";

  constructor(private http: HttpClient) {}

  getHeaders() {
    const token = localStorage.getItem("token");
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getMessages(offerId: string) {
    return this.http.get(`${this.apiUrl}/${offerId}`, this.getHeaders());
  }

  sendMessage(data: any) {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }
}