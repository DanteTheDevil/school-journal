import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { TeacherEditComponent } from './teachers/teacher-edit/teacher-edit.component';
import { DialogEntryComponent } from './teachers/teachers-list/dialog/dialog-overview';
import { TeachersListComponent } from './teachers/teachers-list/teachers-list.component';
import { StudentsListComponent } from './students-list/students-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPanelComponent
  },
  {
    path: 'students',
    component: StudentsListComponent
  },
  {
    path: 'teachers/new',
    component: TeacherEditComponent
  },
  {
    path: 'teachers',
    component: TeachersListComponent,
    children: [
      {
        path: ':id',
        component: DialogEntryComponent
      }
    ]
  },
  {
    path: 'teachers/:id/edit',
    component: TeacherEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule {}
