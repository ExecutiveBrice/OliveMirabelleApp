import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Commande } from '../commande';
import { SMS } from '@ionic-native/sms/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Email } from '../email';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  email: Email = {
    to : "",
    subject : "",
    text : ""    
  }

  loading:boolean = false;
  commandesToDay: Commande[] = [
  ];


  commandesTomorrow: Commande[] = [
  ];

  //CONFIGURATION
  options = {
    replaceLineBreaks: false, // true to replace \n by a new line, false by default
    android: {
      //intent: 'INTENT'  // send SMS with the native android SMS messaging
      intent: '' // send SMS without opening any other app
    }
  };



   
   // Send a text message using default options
  constructor(
    private sms: SMS, public api: ApiService,
    public loadingController: LoadingController,
    public router: Router,
    public route: ActivatedRoute,
    public backgroundMode: BackgroundMode) { }

  ngOnInit() {



    console.log(this.sms.hasPermission());

    this.getCommandes()

    this.backgroundMode.enable();
    //this.backgroundMode.moveToBackground();
    this.backgroundMode.on("activate").subscribe(() => {
      console.log("activate")

      this.surprise(this.getCommandes());
    });
  }


  surprise(callback) {
    (function loop() {
      var now = new Date();
      if (now.getMinutes() === 0) {
        callback();
      }
      now = new Date(); // allow for time passing
      var delay = 60000 - (now.getMilliseconds() % 60000); // exact ms to next minute interval
      setTimeout(loop, delay);
    })();
  }

  async hasPermission() {
    const loading = await this.sms.hasPermission()
    return loading;
  }

  getCommandes() {
    this.loading = true;
    console.log("this.commandes");
    let count = 0;
    this.commandesToDay = [];
    this.api.getCommandesNew()
      .subscribe(res => {
        console.log("this.commandes.subscribe");
        console.log(res);
        if (res['reservations']) {
          res['reservations'].forEach(commande => {
            commande.open = true
            this.commandesToDay.push(commande)
            if (commande.alerte != 2) {
              count++;
              this.alerteDone(commande)
            }
          });
          if (count > 0) {
            this.sms.send('0676762393', "Il y a " + count + "nouvelle commande à préparer pour aujourd'hui", this.options);
          }
        }
        this.loading = false;
      }, err => {
        this.loading = false;
        console.log(err);
      });

    let countDemain = 0;
    this.commandesTomorrow = [];
    this.api.getCommandesTomorrow()
      .subscribe(res => {
        console.log("this.commandes.subscribe");
        console.log(res);
        if (res['reservations']) {
          res['reservations'].forEach(commande => {
            commande.open = true
            this.commandesTomorrow.push(commande)
            if (commande.alerte != 2) {
              countDemain++;
              this.alerteDone(commande)
            }
          });
          if (countDemain > 0) {
            this.sms.send('0676762393', "Il y a " + countDemain + "nouvelle(s) commande à préparer pour demain", this.options);
          }
        }
        this.loading = false;
      }, err => {
        this.loading = false;
        console.log(err);
      });
  }

  alerteDone(commande) {
    commande.alerte = 2;
    this.api.updateCommande(commande)
      .subscribe(res => {
        console.log("this.api.actualiseAlerte");
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  preparer(commande: Commande) {
    console.log("preparation");
    commande.etat = 'Encours';
    if(commande.mail){
      this.email.to = commande.mail
      this.email.subject = "Préparation de commande en cours"
      this.email.text = "Bonjour,</br>Votre commande de "+commande.produit+" est en cours de préparation"
      this.envoiMail(this.email)
    }
    if(commande.tel){
    this.sms.send(commande.tel, "Votre commande de "+ commande.produit+" est en cours de préparation", this.options);
    }
    this.api.updateCommande(commande)
      .subscribe(res => {
        console.log("this.api.updateCommande");
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  terminer(commande: Commande) {
    console.log("retrait");
    commande.etat = 'Terminer';
    if(commande.mail){
      this.email.to = commande.mail
      this.email.subject = "Commande prête"
      this.email.text = "Bonjour,</br>Votre commande de "+commande.produit+" est prête, vous pouvez venir la retirer chez Olive&Mirabelle"
      this.envoiMail(this.email)
    }
    if(commande.tel){
    this.sms.send(commande.tel, "Votre commande de "+ commande.produit+" est prête, vous pouvez venir la retirer chez Olive&Mirabelle", this.options);
    }
    this.api.updateCommande(commande)
      .subscribe(res => {
        console.log("this.api.updateCommande");
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  
  annuler(commande: Commande) {
    console.log("Annule");
    commande.etat = 'Annule';
    if(commande.mail){
      this.email.to = commande.mail
      this.email.subject = "Annulation de commande"
      this.email.text = "Bonjour,</br>Votre commande de "+commande.produit+" a été annulée par Olive&Mirabelle"
      this.envoiMail(this.email)
    }
    if(commande.tel){
      this.sms.send(commande.tel, "Votre commande de "+ commande.produit+" a été annulée par Olive&Mirabelle", this.options);
    }
    
    this.api.updateCommande(commande)
      .subscribe(res => {
        console.log("this.api.updateCommande");
        console.log(res);
      }, err => {
        console.log(err);
      });
  }


  envoiMail(email: Email) {
    this.api.sendMail(email)
      .subscribe(res => {
        console.log("this.api.sendMail");
        console.log(res);
      }, err => {
        console.log(err);
      });
  }
  
   
}
