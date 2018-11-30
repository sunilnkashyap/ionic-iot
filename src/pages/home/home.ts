import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController, AlertController  } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SMS } from '@ionic-native/sms';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { ToastController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { ActionSheetController } from 'ionic-angular';


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
    private callNumber: CallNumber,
    public actionSheetCtrl: ActionSheetController
    ) {
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE);
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS);
      this.storage.forEach( r => {
        this.devices.push(r);
      })
  }
  
  openActionSheet(currentRef) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Modify your device',
      buttons: [
        {
          icon: 'copy',
          text: 'Edit',
          role: 'edit',
          handler: () => {
            this.editDevice(currentRef);
          }
        },{
          text: 'Delete',
          icon: 'trash',
          handler: () => {
            this.deleteDevice(currentRef);
            console.log('Delete clicked');
          }
        }
      ]
    });
    actionSheet.present();
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
          handler: data => { }
        },
        {
          text: 'Save',
          handler: data => {
            let uid = '_' + Math.random().toString(36).substr(2, 9);
            this.storage.set(uid, {device: data.device, state: 0, mobile: data.mobile, uid: uid});
            this.devices.push({device: data.device, state: 0, mobile: data.mobile, uid: uid});
          }
        }
      ]
    });
    alert.present();
  }

  updateDevice(ref) {
    let state = ref.state != 0 ? 0 : 1;
    this.storage.remove(ref.device);
    ref.state = state;
    this.storage.set(ref.device, {device: ref.device, state: state, mobile: ref.mobile});
    this.sendMessage(ref);
  }

  onDevice(ref) {
    let state = 1;
    ref.state = state;
    this.storage.set(ref.uid, {device: ref.device, state: state, mobile: ref.mobile, uid: ref.uid});
    this.sendMessage(ref);
  }

  offDevice(ref) {
    let state = 0;
    // this.storage.remove(ref.device);
    ref.state = state;
    this.storage.set(ref.uid, {device: ref.device, state: state, mobile: ref.mobile, uid: ref.uid});
    this.sendMessage(ref);
  }

  

  editDevice(ref) {
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
          }
        },
        {
          text: 'Save',
          handler: data => {
            let state = ref.state;
            // this.storage.remove(ref.device);
            this.storage.set(ref.uid, {device: data.device, state: state, mobile: data.mobile, uid: ref.uid});
            this.refreshList();
            // this.msgAlert.present();
          }
        }
      ]
    });
    alert.present();
  }

  deleteDevice(ref) {
    let alert = this.alertCtrl.create({
      title: 'Confirm delete',
      message: 'Do you want to delete this device?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.storage.remove(ref.uid);
            this.refreshList();
          }
        }
      ]
    });
    alert.present();

    
  }

  refreshList() {
    this.devices = [];
    let TIME_IN_MS = 100;
    setTimeout( () => {
        this.storage.forEach( r => {
          this.devices.push(r);
        })
    }, TIME_IN_MS);
  }


  sendMessage(ref) {
    console.log('sendmessage: ', ref)
    if (this.sms.hasPermission()) {
      let msg = ref.state == 1 ? 'ON' : 'OFF';
      this.sms.send(ref.mobile, msg).then( r => {
        const toast = this.toastCtrl.create({
          message: 'Command sent to device.',
          duration: 3000
        });
        toast.present();
        this.refreshList();
      }).catch(e => {
        const toast = this.toastCtrl.create({
          message: 'Command not sent. Device is not active.',
          duration: 3000
        });
        toast.present();
        this.storage.remove(ref.device);
        let state = ref.state == 0 ? 1 : 0;
        this.storage.set(ref.device, {device: ref.device, state: state, mobile: ref.mobile});
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


  initCall(phone){
    this.callNumber.callNumber(phone, true);
  }
}
