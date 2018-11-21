import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController, AlertController  } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SMS } from '@ionic-native/sms';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { ToastController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  devices = [];

  msgAlert;

  constructor(
    public androidPermissions: AndroidPermissions,
    private sms: SMS,
    private storage: Storage,
    private alertCtrl: AlertController, 
    public navCtrl: NavController, 
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    private callNumber: CallNumber
    ) {
      // this.msgAlert = this.alertCtrl.create({
      //   title: 'Device Save Successfully.',
      //   subTitle: 'You can change status of current device by toggle button.',
      //   buttons: ['Dismiss']
      // });

      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS);
     
      this.storage.forEach( r => {
        console.log(r);
        this.devices.push(r);
      })
  }
  
  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Add New Device',
      inputs: [
        {
          name: 'device',
          placeholder: 'Device Name'
        },
        {
          name: 'mobile',
          placeholder: 'Mobile Number',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log(data);
            this.storage.set(data.device, {device: data.device, state: 1, mobile: data.mobile});
            this.devices.push({device: data.device, state: 1, mobile: data.mobile});
            // this.msgAlert.present();
          }
        }
      ]
    });
    alert.present();
  }

  updateDevice(ref) {
    console.log(ref);
    let state = ref.state ? 1 : 0;
    this.storage.remove(ref.device);
    this.storage.set(ref.device, {device: ref.device, state: state, mobile: ref.mobile});
    this.sendMessage(ref);
  }

  editDevice(ref) {
    console.log(ref);
    let alert = this.alertCtrl.create({
      title: 'Edit Device',
      inputs: [
        {
          name: 'device',
          placeholder: 'Device Name',
          value: ref.device
        },
        {
          name: 'mobile',
          placeholder: 'Mobile Number',
          type: 'number',
          value: ref.mobile
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log(data);
            let state = ref.state ? 1 : 0;
            this.storage.remove(ref.device);
            this.storage.set(data.device, {device: data.device, state: state, mobile: data.mobile});
            this.refreshList();
            // this.msgAlert.present();
          }
        }
      ]
    });
    alert.present();
  }

  deleteDevice(ref) {
    this.storage.remove(ref.device);
    this.refreshList();
  }

  refreshList() {
    console.log('---refresh---')
    this.devices = [];
    let TIME_IN_MS = 100;
    setTimeout( () => {
        // somecode
        this.storage.forEach( r => {
          console.log(r);
          this.devices.push(r);
        })
    }, TIME_IN_MS);
    
  }


  sendMessage(ref) {
    
    if (this.sms.hasPermission()) {
      let msg = ref.state ? 'ON' : 'OFF';
      this.sms.send(ref.mobile, msg).then( r => {
        console.log('---send success---');
        const toast = this.toastCtrl.create({
          message: 'Command sent to device.',
          duration: 3000
        });
        toast.present();
      }).catch(e => {
        console.log('---error---');
        const toast = this.toastCtrl.create({
          message: 'Command not sent. Device is not active.',
          duration: 3000
        });
        toast.present();
        this.storage.remove(ref.device);
        this.storage.set(ref.device, {device: ref.device, state: 0, mobile: ref.mobile});
        this.refreshList();
      })
      
    } else {

      let msgAlert = this.alertCtrl.create({
        title: 'We dont have permission to send messages.',
        subTitle: 'Please accept to allow sending messages.',
        buttons: ['Dismiss']
      });
    msgAlert.present();

      

    }
  }


  initCall(){
    this.callNumber.callNumber("18001010101", true)
  .then(res => console.log('Launched dialer!', res))
  .catch(err => console.log('Error launching dialer', err));
  }
}
