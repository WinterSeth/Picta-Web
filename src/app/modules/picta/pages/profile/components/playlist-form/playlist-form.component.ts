import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

@Component({
    selector: 'app-playlist-form',
    templateUrl: './playlist-form.component.html',
    styleUrls: ['./playlist-form.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatDialogActions, MatButton, MatDialogClose, MatIcon]
})
export class PlaylistFormComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);

  playlistForm: UntypedFormGroup;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.playlistForm = this.fb.group({
      nombre: ['', [Validators.required]],
      publicacion: [[]]
    });
  }
}
