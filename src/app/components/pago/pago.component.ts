import {Component,OnInit} from '@angular/core';
import {IPayPalConfig,ICreateOrderRequest } from 'ngx-paypal';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Trabajo, User } from 'src/app/models/models';
import { Publicacion } from 'src/app/models/publicacion';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import axios from 'axios';
import { Location } from '@angular/common';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {

  public payPalConfig ? : IPayPalConfig;
  public trabajo: Trabajo | undefined;
  public publicacion: Publicacion | undefined;
  public nombreTrabajador = '';
  private precioUSD: number = 0;
  public paymentCancel = false;

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore,private publicaciones: PublicacionesService,private router: Router,private location: Location) { }


  ngOnInit(): void {
    this.initConfig();
    this.route.queryParams.subscribe(params => {
        const trabajoId = params['trabajoId'];
        const publicacionId = params['publicacionId'];
    
        console.log('trabajoId:', trabajoId);
        console.log('publicacionId:', publicacionId);
    
        this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).get().toPromise().then((trabajoDoc) => {
          if (trabajoDoc && trabajoDoc.exists) {
            this.trabajo = trabajoDoc.data() as Trabajo;
            if (this.trabajo && this.trabajo.precio) {
                const precio = Number(this.trabajo.precio.replace(/[^\d]/g, ''));
                console.log('Precio del trabajo en número:', precio);
                this.calcularPrecioUSD(precio);
                
              }
              
              
            this.firestore.collection<User>('Usuarios').doc(this.trabajo.idUsuarioPublicacion).get().toPromise().then((usuarioDoc) => {
              if (usuarioDoc && usuarioDoc.exists) {
                const usuario = usuarioDoc.data() as User;
                this.nombreTrabajador = usuario.nombre + ' ' + usuario.apellido;
                this.publicaciones.uidUsuario = usuario.uid;
              }
            });
          }
        });
    
        this.firestore.collection<Publicacion>('Publicaciones').doc(publicacionId).get().toPromise().then((publicacionDoc) => {
          if (publicacionDoc && publicacionDoc.exists) {
            this.publicacion = publicacionDoc.data() as Publicacion;
          }
        });
      });
    }

    calcularPrecioUSD(precioCLP: number): void {
        axios.get('https://api.exchangerate-api.com/v4/latest/CLP')
          .then(response => {
            const rate = response.data.rates.USD;
            console.log(`1 CLP equivale a ${rate} USD`);
            this.precioUSD = parseFloat((precioCLP * rate).toFixed(1));
            console.log('El precio del trabajo en USD es:', this.precioUSD);
          })
          .catch(error => {
            console.log(error);
          });
      }



private initConfig(): void {
    this.payPalConfig = {
        currency: 'USD',
        clientId: 'AcD-r91UFp5Xa_CPRk0k98qvOgggxb4O_LN85NH4MuIPK4_17d7lmxReQ0R-tg6Kl33aVcdR3kTGFp9G',
        createOrderOnClient: (data) => < ICreateOrderRequest > {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: `${this.precioUSD}`, // Use precioUSD as the value
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: `${this.precioUSD}`, // Use precioUSD as the value
                        }
                    }
                },
                items: [{
                    name: 'Enterprise Subscription',
                    quantity: '1',
                    category: 'DIGITAL_GOODS',
                    unit_amount: {
                        currency_code: 'USD',
                        value: `${this.precioUSD}`, // Use precioUSD as the value
                    },
                }]
            }]
        },
        advanced: {
            commit: 'true'
        },
        style: {
            label: 'paypal',
            layout: 'vertical'
        },
        onApprove: (data, actions) => {
            console.log('onApprove - transaction was approved, but not authorized', data, actions);
            actions.order.get().then((details: any) => {
                console.log('onApprove - you can get full order details inside onApprove: ', details);
            });

        },
        onClientAuthorization: (data) => {
            console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
         // Cambiar el estado de trabajo a Abonado
            this.changeWorkStatusToAbonado();

  // Volver a la página anterior
           this.location.back();


        },
        onCancel: (data, actions) => {
            console.log('OnCancel', data, actions);
            this.paymentCancel = true;
        },
        onError: err => {
            console.log('OnError', err);
        },
        onClick: (data, actions) => {
            console.log('onClick', data, actions);
        }
    };
}

private changeWorkStatusToAbonado(): void {
  if (this.trabajo) {
    this.trabajo.estado = 'Abonado'; 
    const trabajoId = this.route.snapshot.queryParams['trabajoId'];
    this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
      console.log('Trabajo actualizado con éxito');
    }).catch((error) => {
      console.error('Error al actualizar el trabajo:', error);
    });
  }
}

}






