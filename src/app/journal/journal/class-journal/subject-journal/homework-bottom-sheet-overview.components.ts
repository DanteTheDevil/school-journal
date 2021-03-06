import { Component, Inject, OnInit } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
  MatSnackBar,
  MatSnackBarConfig,
  MatDialog
} from '@angular/material';
import { HomeworkStorageService } from '../../../../services/homework-storage.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SubjectAttachmentDialogComponent } from '../../../../shared/subject-attachment-dialog/subject-attachment-dialog.component';

@Component({
  selector: 'app-homework-bottom-sheet',
  templateUrl: 'homework-bottom-sheet-overview.html',
  styleUrls: ['./homework-bottom-sheet-overview.scss']
})
export class HomeworkBottomSheetOverviewSheetComponent implements OnInit {
  file: string;
  fileName: string;
  fileType: string;
  homeworkForm: FormGroup;
  selectedFileName: string;
  lessonId = this.data.lessonId;
  homeworks = this.data.homeworks;
  markType = this.data.markType;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private homeworkStorageService: HomeworkStorageService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private bottomSheetRef: MatBottomSheetRef<
      HomeworkBottomSheetOverviewSheetComponent
    >,
    public attachmentDialog: MatDialog
  ) {}

  /**
   * Method builds a form group accordingly to available data.
   */
  ngOnInit() {
    this.homeworkForm = this.formBuilder.group({
      message: [
        this.homeworks[this.lessonId].homework
          ? this.homeworks[this.lessonId].homework
          : ''
      ],
      homeworkFile: [''],
      homeworkGetFile: [
        this.homeworks[this.lessonId].fileName
          ? this.homeworks[this.lessonId].fileName
          : ''
      ]
    });
  }
  /**
   * Method gathers provided by user information, creates an object from
   * that and sends it to the server by saveHomework method in order to
   * save a new homework.
   */
  onSubmit() {
    this.homeworkStorageService
      .saveHomework({
        homework: this.homeworkForm.value.message,
        idLesson: this.lessonId,
        fileData: this.homeworkForm.value.homeworkFile ? this.file : null,
        fileType: this.fileType ? this.fileType : null,
        fileName: this.fileName ? this.fileName : null
      })
      .subscribe(
        () => {
          this.homeworks[
            this.lessonId
          ].homework = this.homeworkForm.value.message;
          if (this.fileName) {
            this.homeworks[this.lessonId].fileName = this.fileName;
          }
          this.bottomSheetRef.dismiss();
          this.openSnackBar(`Нові дані внесено`, 'snack-class-success-journal');
        },
        error => {
          console.log(error);
          this.bottomSheetRef.dismiss();
          this.openSnackBar(
            `На сервері відбулась помилка`,
            'snack-class-fail-journal'
          );
        }
      );
  }

  /**
   * Method clears the homework for previosly selected lesson.
   */
  onClear() {
    this.homeworkStorageService
      .saveHomework({
        homework: '',
        idLesson: +this.lessonId,
        fileData: '',
        fileType: '',
        fileName: ''
      })
      .subscribe(
        () => {
          this.homeworks[this.lessonId].homework = '';
          this.homeworks[this.lessonId].fileName = '';
          this.bottomSheetRef.dismiss();
          this.openSnackBar(`Завдання видалено`, 'snack-class-success-journal');
        },
        error => {
          console.log(error);
          this.bottomSheetRef.dismiss();
          this.openSnackBar(
            `На сервері відбулась помилка`,
            'snack-class-fail-journal'
          );
        }
      );
  }

  /**
   * Method closes homework bottom sheet dialog.
   */
  onBack() {
    this.bottomSheetRef.dismiss();
  }

  /**
   * Method fetches from the server homework file for available id,
   * passes received file object to convertBase64ToBlobData function and once
   * all the transformation logic is done it creates temporary link in order
   * to let user save the file itself
   */
  dwnl(event: Event) {
    event.preventDefault();
    this.homeworkStorageService.saveFile(this.lessonId).subscribe(data => {
      const blobData = this.convertBase64ToBlobData(data);
      const blob = new Blob([blobData], { type: data.fileType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName;
      link.click();
    });
  }

  /**
   * Method handle upload mechanism from component
   * @param event - event object containing uploaded file.
   */
  onFileSelected(event: { target: HTMLInputElement }) {
    const file = event.target.files[0];
    let selectedFileName = (event.target as HTMLInputElement).value.split(
      '\\'
    )[2];
    if (selectedFileName.length > 20) {
      selectedFileName =
        selectedFileName.substr(0, 15) + '...' + selectedFileName.split('.')[1];
    }
    this.selectedFileName = selectedFileName;
    const reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
    this.fileName = file.name;
    this.fileType = file.type;
  }

  /**
   * Method takes uploaded object file, derives from there file data
   * and assigns it to the local variable
   * @param e - event object containing uploaded file.
   */
  _handleReaderLoaded(e: { target: any }) {
    const reader = e.target;
    this.file = reader.result.split(',')[1];
  }

  /**
   * Method receives object with data in base64-encoded string,
   * atob function decodes it into a new string with a character for
   * each byte of the binary data. Then it creates an array of byte values
   * using the .charCodeAt method for each character in the string and converts
   * this array of byte values into a real typed byte array by passing it to the
   * Uint8Array constructor. This in turn is converted to a Blob by wrapping
   * it in an array and passing it to the Blob constructor. In order to improve
   * the performance byteCharacters are pocessed in smaller slices which is 512 bytes.
   * @return blob - BlobData object.
   */
  convertBase64ToBlobData(data: { fileData: string; fileType: string }) {
    const sliceSize = 512;
    const byteCharacters = atob(data.fileData);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: data.fileType });
    return blob;
  }

  /**
   * Method opens and provides configuration for a snackbar.
   */
  openSnackBar(message: string, classMessage: string) {
    const config = new MatSnackBarConfig();
    config.panelClass = [classMessage];
    config.duration = 2000;
    config.verticalPosition = 'top';
    this.snackBar.open(message, null, config);
  }

  /**
   * Method opens dialog for attachment view
   * @param event - Event object
   */
  public openAttachment(event: { preventDefault: () => void; }): void {
    event.preventDefault();
    this.homeworkStorageService.saveFile(this.lessonId).subscribe(data => {
      this.attachmentDialog.open(SubjectAttachmentDialogComponent, {
        width: '97vw',
        height: '93vh',
        maxWidth: '97vw',
        maxHeight: '90vh',
        data
      });
    });
  }
}
