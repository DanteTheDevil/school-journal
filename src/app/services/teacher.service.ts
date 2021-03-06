import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeacherData } from '../models/teacher-data';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(private http: HttpClient) { }

  /**
   * Method gets number of all teachers
   * @returns - Number of classes
   */
  public getTeachers(): Observable<TeacherData[]> {
    return this.http.get('/teachers')
      .pipe(
        map((result: {status: any, data: TeacherData[] | null}) => result.data)
      );
  }
}
