import * as THREE from 'three';
import { AppConfig } from '../types';

export class DebugPanel {
  private fpsElement: HTMLElement;
  private wireframeCheckbox: HTMLInputElement;
  private axesCheckbox: HTMLInputElement;
  private performanceCheckbox: HTMLInputElement;
  private axesHelper: THREE.AxesHelper | null = null;
  private scene: THREE.Scene | null = null;
  private onConfigChange: ((config: Partial<AppConfig>) => void) | null = null;

  constructor() {
    this.fpsElement = document.getElementById('fps-counter') as HTMLElement;
    this.wireframeCheckbox = document.getElementById('setting-wireframe') as HTMLInputElement;
    this.axesCheckbox = document.getElementById('setting-axes') as HTMLInputElement;
    this.performanceCheckbox = document.getElementById('setting-performance') as HTMLInputElement;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wireframeCheckbox.addEventListener('change', () => {
      if (this.onConfigChange) {
        this.onConfigChange({ wireframe: this.wireframeCheckbox.checked });
      }
    });

    this.axesCheckbox.addEventListener('change', () => {
      this.toggleAxesHelper(this.axesCheckbox.checked);
      if (this.onConfigChange) {
        this.onConfigChange({ showAxes: this.axesCheckbox.checked });
      }
    });

    this.performanceCheckbox.addEventListener('change', () => {
      if (this.onConfigChange) {
        this.onConfigChange({ performanceMode: this.performanceCheckbox.checked });
      }
    });
  }

  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  private toggleAxesHelper(show: boolean): void {
    if (!this.scene) return;

    if (show) {
      if (!this.axesHelper) {
        this.axesHelper = new THREE.AxesHelper(2);
        this.axesHelper.renderOrder = 999;
      }
      this.scene.add(this.axesHelper);
    } else {
      if (this.axesHelper) {
        this.scene.remove(this.axesHelper);
      }
    }
  }

  updateFps(fps: number): void {
    this.fpsElement.textContent = `${fps} FPS`;
  }

  setOnConfigChange(callback: (config: Partial<AppConfig>) => void): void {
    this.onConfigChange = callback;
  }

  getConfig(): AppConfig {
    return {
      wireframe: this.wireframeCheckbox.checked,
      showAxes: this.axesCheckbox.checked,
      performanceMode: this.performanceCheckbox.checked,
      debugMode: false,
      autoRotate: false
    };
  }
}
