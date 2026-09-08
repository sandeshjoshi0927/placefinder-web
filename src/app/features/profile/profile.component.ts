import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { AvatarComponent } from '@shared/avatar/avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  readonly user = this.auth.currentUser;

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: [this.user()?.name ?? '', Validators.required],
  });

  private formChanges = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  readonly saveDisabled = computed(() => {
    this.formChanges();
    return this.form.pristine || this.form.invalid || this.saving();
  });

  save(): void {
    if (this.saveDisabled()) return;

    this.saving.set(true);
    this.saveError.set(null);

    this.auth.updateName(this.form.getRawValue().name).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.markAsPristine();
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Could not save changes. Try again.');
      },
    });
  }
}
