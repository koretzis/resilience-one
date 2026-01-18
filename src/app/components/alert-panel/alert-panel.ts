import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { selectCascadingRisks } from '../../store/infrastructure.selectors';

@Component({
  selector: 'app-alert-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf],
  template: `
    <div class="alert-box" *ngIf="(alerts$ | async) as alerts">
      <div *ngFor="let alert of alerts" class="alert-item">
        ⚠️ {{ alert }}
      </div>
    </div>
  `,
  styles: [`
    .alert-box {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .alert-item {
      background: rgba(255, 0, 85, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class AlertPanel {
  private store = inject(Store);
  // Select the INTELLIGENT inference, not just raw data
  alerts$ = this.store.select(selectCascadingRisks);
}