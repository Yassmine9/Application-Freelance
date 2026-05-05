import { Component, Input } from '@angular/core';
import {
  IonicModule,
  ModalController,
  ToastController
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class CheckoutComponent {

  @Input() product: any;

  payment = {
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  isProcessing = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  close() {
    this.modalCtrl.dismiss();
  }

  async pay() {
    if (
      !this.payment.cardName ||
      !this.payment.cardNumber ||
      !this.payment.expiry ||
      !this.payment.cvv
    ) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill all fields',
        duration: 2000,
        position: 'top'
      });

      await toast.present();
      return;
    }

    this.isProcessing = true;

    // backend later
    setTimeout(() => {
      this.isProcessing = false;

      this.modalCtrl.dismiss({
        success: true,
        payment: this.payment
      });
    }, 1500);
  }
}