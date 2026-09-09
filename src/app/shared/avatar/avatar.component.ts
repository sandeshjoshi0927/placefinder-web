import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="avatar" [attr.aria-label]="name">{{ initials }}</div>`,
  styles: [
    `
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #4a69bd;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AvatarComponent {
  @Input({ required: true }) name!: string;

  get initials(): string {
    return this.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
