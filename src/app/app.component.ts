import { Component } from '@angular/core';
import { Network } from '@capacitor/network';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isOnline: boolean = true;

  constructor(private toastCtrl: ToastController) {
    this.initNetworkListener();
  }

  async initNetworkListener() {
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;

      Network.addListener('networkStatusChange', async (status) => {
        this.isOnline = status.connected;
        const toast = await this.toastCtrl.create({
          message: status.connected
            ? 'Back online!'
            : 'You are offline. Data is saved locally.',
          duration: 3000,
          color: status.connected ? 'success' : 'warning',
          position: 'bottom',
          icon: status.connected ? 'wifi' : 'cloud-offline',
        });
        toast.present();
      });
    } catch (e) {
      console.warn('Network plugin not available:', e);
    }
  }
}
