import { Component } from '@angular/core';
import { CreateFieldModalComponent } from '../create-field-modal/create-field-modal.component'
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-create-user-form',
  standalone: true,
  imports: [CreateFieldModalComponent,
    CommonModule
  ],
  templateUrl: './create-user-form.component.html',
  styleUrl: './create-user-form.component.scss'
})

export class CreateUserFormComponent {
   isModalVisible = false;

 openModal(event: Event) {
    event.preventDefault();
   this.isModalVisible = true;
 }
 closeModal() {
    this.isModalVisible = false;
  }

}