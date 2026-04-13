import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemeService } from '../../services/meme';

@Component({
  selector: 'app-create-meme',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    RouterLink,
  ],
  template: `
    <div class="create-meme-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>{{ memeId ? 'Edit Meme' : 'Create New Meme' }}</span>
      </mat-toolbar>

      <div class="form-container">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>
              {{ memeId ? 'Edit Your Meme' : 'Share a New Meme' }}
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <!-- Title Field -->
              <mat-form-field class="full-width">
                <mat-label>Title</mat-label>
                <input
                  matInput
                  formControlName="title"
                  placeholder="Give your meme a title"
                  required
                />
                <mat-error *ngIf="form.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
                <mat-error *ngIf="form.get('title')?.hasError('minlength')">
                  Title must be at least 3 characters
                </mat-error>
              </mat-form-field>

              <!-- Caption Field -->
              <mat-form-field class="full-width">
                <mat-label>Caption</mat-label>
                <textarea
                  matInput
                  formControlName="caption"
                  placeholder="Add a caption or description"
                  rows="3"
                  required
                ></textarea>
                <mat-error *ngIf="form.get('caption')?.hasError('required')">
                  Caption is required
                </mat-error>
                <mat-error *ngIf="form.get('caption')?.hasError('minlength')">
                  Caption must be at least 5 characters
                </mat-error>
              </mat-form-field>

              <!-- Image Upload/Preview Section -->
              <div class="image-upload-section">
                <!-- Upload Box (shown when no image selected) -->
                <ng-container *ngIf="!form.get('imageUrl')?.value || isUploading()">
                  <label for="imageInput" class="upload-label">
                    <div class="upload-box">
                      <mat-icon>image</mat-icon>
                      <p>Click to upload meme image</p>
                      <span class="file-info">Any image format up to 5MB</span>
                    </div>
                  </label>
                  <input
                    #fileInput
                    type="file"
                    id="imageInput"
                    hidden
                    accept="image/*"
                    (change)="onFileSelected($event)"
                    [disabled]="isUploading()"
                  />
                </ng-container>

                <!-- Upload Progress -->
                <div *ngIf="isUploading()" class="upload-progress">
                  <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                  <p>Uploading image...</p>
                </div>

                <!-- Image Preview (shown when image selected and not uploading) -->
                <div *ngIf="form.get('imageUrl')?.value && !isUploading()" class="image-preview">
                  <img
                    [src]="form.get('imageUrl')?.value"
                    alt="Preview"
                    (error)="onImageError()"
                  />
                  <button
                    type="button"
                    mat-icon-button
                    (click)="clearImage()"
                    class="clear-button"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                </div>

                <!-- Upload Error -->
                <mat-error *ngIf="uploadError()">
                  {{ uploadError() }}
                </mat-error>
              </div>

              <!-- Category Select -->
              <mat-form-field class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="funny">Funny</mat-option>
                  <mat-option value="political">Political</mat-option>
                  <mat-option value="reaction">Reaction</mat-option>
                  <mat-option value="motivational">Motivational</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Public Checkbox -->
              <div class="checkbox-group">
                <mat-checkbox formControlName="isPublic">
                  Make this meme public
                </mat-checkbox>
                <p class="hint">
                  {{
                    form.get('isPublic')?.value
                      ? 'This meme will be visible to everyone'
                      : 'Only you will see this meme'
                  }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="button-group">
                <button
                  mat-raised-button
                  type="submit"
                  color="primary"
                  [disabled]="!form.valid || isSubmitting() || isUploading()"
                >
                  <mat-icon *ngIf="!isSubmitting()">check</mat-icon>
                  <mat-spinner
                    *ngIf="isSubmitting()"
                    diameter="20"
                  ></mat-spinner>
                  {{ memeId ? 'Update Meme' : 'Create Meme' }}
                </button>
                <button mat-button type="button" routerLink="/">Cancel</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .create-meme-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    mat-toolbar {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }

    .form-card {
      width: 100%;
      max-width: 600px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 600;
    }

    mat-card-content {
      padding: 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .image-upload-section {
      margin: 16px 0;
    }

    .upload-label {
      cursor: pointer;
      display: block;
    }

    .upload-box {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      transition: all 0.3s;
    }

    .upload-box:hover {
      border-color: #3f51b5;
      background: #f8f9ff;
    }

    .upload-box mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
      margin: 0 auto;
    }

    .upload-box p {
      margin: 12px 0 4px;
      font-weight: 500;
      color: #333;
    }

    .file-info {
      display: block;
      font-size: 12px;
      color: #999;
    }

    .upload-progress {
      text-align: center;
      margin: 16px 0;
    }

    .upload-progress p {
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }

    .image-preview {
      position: relative;
      width: 100%;
      max-height: 300px;
      overflow: hidden;
      border-radius: 8px;
      margin-top: 12px;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .clear-button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
    }

    .clear-button:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    .checkbox-group {
      margin: 16px 0;
    }

    .checkbox-group .hint {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
      margin-bottom: 0;
    }

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    button {
      min-width: 120px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    mat-error {
      font-size: 12px;
    }
  `]
})
export class CreateMemeComponent implements OnInit {
  form!: FormGroup;
  memeId: string | null = null;
  isSubmitting = signal(false);
  isUploading = signal(false);
  uploadError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private memeService: MemeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.memeId = params['id'];
        this.loadMeme();
      }
    });
  }

  private initializeForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      caption: ['', [Validators.required, Validators.minLength(5)]],
      imageUrl: ['', [Validators.required]],
      category: ['funny'],
      isPublic: [true],
    });
  }

  private loadMeme() {
    if (!this.memeId) return;

    this.memeService.getMeme(this.memeId).subscribe({
      next: (meme) => {
        this.form.patchValue({
          title: meme.title,
          caption: meme.caption,
          imageUrl: meme.imageUrl,
          category: meme.category,
          isPublic: meme.isPublic,
        });
      },
      error: (error) => {
        console.error('Error loading meme:', error);
        this.router.navigate(['/']);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('File is too large. Maximum size is 5MB.');
      return;
    }

    // Accept any image type
    if (!file.type.startsWith('image/')) {
      this.uploadError.set('Please select a valid image file.');
      return;
    }

    this.uploadError.set(null);
    this.isUploading.set(true);

    this.memeService.uploadImage(file).subscribe({
      next: (response) => {
        this.form.get('imageUrl')?.setValue(response.imageUrl);
        this.isUploading.set(false);
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploadError.set(error.error?.message || 'Failed to upload image');
        this.isUploading.set(false);
      }
    });
  }

  clearImage() {
    this.form.get('imageUrl')?.setValue('');
    this.uploadError.set(null);
  }

  submitForm() {
    if (!this.form.valid) return;

    this.isSubmitting.set(true);

    if (this.memeId) {
      // Update existing meme
      this.memeService.updateMeme(this.memeId, this.form.value).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error updating meme:', error);
          this.isSubmitting.set(false);
        },
      });
    } else {
      // Create new meme
      this.memeService.createMeme(this.form.value).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error creating meme:', error);
          this.isSubmitting.set(false);
        },
      });
    }
  }

  onImageError() {
    this.form.get('imageUrl')?.setErrors({ 'invalidImage': true });
  }
}
