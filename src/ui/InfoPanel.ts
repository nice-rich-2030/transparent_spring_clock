import { WatchPart } from '../types';

export class InfoPanel {
  private panel: HTMLElement;
  private titleElement: HTMLElement;
  private descriptionElement: HTMLElement;
  private closeButton: HTMLElement;
  private onCloseCallback: (() => void) | null = null;

  constructor() {
    this.panel = document.getElementById('info-panel') as HTMLElement;
    this.titleElement = document.getElementById('info-panel-title') as HTMLElement;
    this.descriptionElement = document.getElementById('info-panel-description') as HTMLElement;
    this.closeButton = document.getElementById('info-panel-close') as HTMLElement;

    this.closeButton.addEventListener('click', () => this.hide());
  }

  show(part: WatchPart): void {
    this.titleElement.textContent = part.name;
    this.descriptionElement.textContent = part.description;
    this.panel.classList.remove('hidden');
  }

  hide(): void {
    this.panel.classList.add('hidden');
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  isVisible(): boolean {
    return !this.panel.classList.contains('hidden');
  }
}
