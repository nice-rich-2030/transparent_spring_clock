import * as THREE from 'three';
import { SceneManager } from './SceneManager';

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  private sceneManager: SceneManager;
  private container: HTMLElement;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private frameCount: number = 0;
  private fpsTime: number = 0;
  private currentFps: number = 60;
  private updateCallbacks: Array<(deltaTime: number) => void> = [];

  constructor(sceneManager: SceneManager, container: HTMLElement) {
    this.sceneManager = sceneManager;
    this.container = container;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.sortObjects = true;

    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.sceneManager.updateAspect(width, height);
    this.renderer.setSize(width, height);
  }

  addUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  removeUpdateCallback(callback: (deltaTime: number) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  private animate(currentTime: number): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));

    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.016;
    }

    this.frameCount++;
    if (currentTime - this.fpsTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = currentTime;
    }

    for (const callback of this.updateCallbacks) {
      callback(this.deltaTime);
    }

    this.renderer.render(
      this.sceneManager.getScene(),
      this.sceneManager.getCamera()
    );
  }

  startAnimationLoop(): void {
    if (this.animationId !== null) return;
    this.lastTime = performance.now();
    this.fpsTime = this.lastTime;
    this.animate(this.lastTime);
  }

  stopAnimationLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getDeltaTime(): number {
    return this.deltaTime;
  }

  getFps(): number {
    return this.currentFps;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  setPerformanceMode(enabled: boolean): void {
    if (enabled) {
      this.renderer.setPixelRatio(1);
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  dispose(): void {
    this.stopAnimationLoop();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
