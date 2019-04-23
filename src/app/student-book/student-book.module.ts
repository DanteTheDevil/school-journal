import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentBookRoutingModule } from './student-book-routing.module';
import { StudentBookComponent } from './student-book/student-book.component';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [StudentBookComponent],
  imports: [
    CommonModule,
    StudentBookRoutingModule,
    MaterialModule
  ]
})
export class StudentBookModule { }
