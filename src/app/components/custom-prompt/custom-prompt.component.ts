import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-custom-prompt',
  template: `
<div class="custom-prompt">
  <h4>Editar</h4>
  <a class="close-button" (click)="closePrompt()"><mat-icon>close</mat-icon></a>
  <input [(ngModel)]="inputValue" placeholder="Ingrese el dato..." />
  <button (click)="save()">Guardar</button>
</div>
  `,
  styleUrls: ['./custom-prompt.component.css']
})
export class CustomPromptComponent {
  inputValue: string = '';

  @Output() saveClicked = new EventEmitter<string>();
  @Output() promptClosed = new EventEmitter<void>();

  save() {
    this.saveClicked.emit(this.inputValue);
  }
  closePrompt() {
    this.promptClosed.emit();
  }
}
