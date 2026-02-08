import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraPreset, CameraPresetConfig } from '../types';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private presets: Map<CameraPreset, CameraPresetConfig>;
  private isAnimating: boolean = false;
  private animationStart: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private animationEnd: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private animationProgress: number = 0;
  private readonly animationDuration: number = 1.0;
  private autoRotateEnabled: boolean = false;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 8;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.5;
    this.controls.rotateSpeed = 0.8;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.5;

    this.presets = new Map([
      ['front', { position: new THREE.Vector3(0, 0, 4), target: new THREE.Vector3(0, 0, 0) }],
      ['back', { position: new THREE.Vector3(0, 0, -4), target: new THREE.Vector3(0, 0, 0) }],
      ['side', { position: new THREE.Vector3(4, 0, 0), target: new THREE.Vector3(0, 0, 0) }],
      ['movement', { position: new THREE.Vector3(1.2, 0.6, 2.5), target: new THREE.Vector3(0.05, 0.05, -0.08) }]
    ]);

    this.controls.addEventListener('start', () => {
      if (this.isAnimating) {
        this.isAnimating = false;
      }
    });
  }

  update(deltaTime: number): void {
    if (this.isAnimating && this.animationStart && this.animationEnd) {
      this.animationProgress += deltaTime / this.animationDuration;

      if (this.animationProgress >= 1) {
        this.camera.position.copy(this.animationEnd.position);
        this.controls.target.copy(this.animationEnd.target);
        this.isAnimating = false;
        this.animationProgress = 0;
      } else {
        const t = this.easeInOutCubic(this.animationProgress);

        this.camera.position.lerpVectors(
          this.animationStart.position,
          this.animationEnd.position,
          t
        );

        this.controls.target.lerpVectors(
          this.animationStart.target,
          this.animationEnd.target,
          t
        );
      }
    }

    this.controls.update();
  }

  private easeInOutCubic(t: number): number {
    if (t < 0.5) {
      return 4 * t * t * t;
    } else {
      return 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  }

  setPresetView(preset: CameraPreset): void {
    const config = this.presets.get(preset);
    if (!config) return;

    this.animationStart = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone()
    };

    this.animationEnd = {
      position: config.position.clone(),
      target: config.target.clone()
    };

    this.animationProgress = 0;
    this.isAnimating = true;
  }

  enableAutoRotate(enable: boolean): void {
    this.autoRotateEnabled = enable;
    this.controls.autoRotate = enable;
  }

  isAutoRotateEnabled(): boolean {
    return this.autoRotateEnabled;
  }

  toggleAutoRotate(): boolean {
    this.autoRotateEnabled = !this.autoRotateEnabled;
    this.controls.autoRotate = this.autoRotateEnabled;
    return this.autoRotateEnabled;
  }

  setAutoRotateSpeed(speed: number): void {
    this.controls.autoRotateSpeed = speed;
  }

  getControls(): OrbitControls {
    return this.controls;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  reset(): void {
    this.setPresetView('front');
  }

  dispose(): void {
    this.controls.dispose();
  }
}
