import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { userDataBank } from 'src/app/models/models';
import { HotToastService } from '@ngneat/hot-toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-transferencia',
  templateUrl: './data-transferencia.component.html',
  styleUrls: ['./data-transferencia.component.css']
})
export class DataTransferenciaComponent implements OnInit {
  userDataForm: FormGroup;
  userData: userDataBank = {
    idUsuarioCuenta: '',
    IdCuenta: '',
    NumCuenta: 0,
    TipoCuenta: '',
    Banco: '',
  };

  bancos = [
    'Banco de Chile',
    'Banco Estado',
    'Banco Santander',
    'Banco BCI',
    'Banco Itaú',
    'Banco Security',
    'Banco Falabella',
    'Banco Scotiabank',
    'Banco Coopeuch',
    'Banco Ripley'
  ];

  tipoCuenta = [
    'Cuenta Vista',
    'Cuenta Corriente',
  ];

  uid: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private toast: HotToastService,
    private router: Router
  ) {
    this.userDataForm = this.formBuilder.group({
      NumCuenta: ['', [Validators.required, Validators.pattern(/^\d{9,12}$/)]],
      TipoCuenta: ['', Validators.required],
      Banco: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.firebaseService.getCurrentUserUid().subscribe((uid: string | null) => {
      if (uid) {
        this.uid = uid;
        console.log(this.uid);
      }
    });
  }

  guardarDatos() {
    if (this.userDataForm.valid) {
      this.userData = {
        ...this.userDataForm.value,
        idUsuarioCuenta: this.uid
      };
      this.firebaseService
        .guardarDatosTransferencia(this.uid, this.userData)
        .then(() => {
          console.log('Datos guardados exitosamente');
          this.toast.success('Datos de tu cuenta de transferencias guardados correctamente!');
          this.router.navigate(['/profile']);
          // Puedes agregar aquí alguna lógica adicional después de guardar los datos
        })
        .catch((error: any) => {
          console.log('Error al guardar los datos:', error);
        });
    } else {
      this.toast.error('Verifica los datos que ingresaste o ingresa datos válidos');
    }
  }
}