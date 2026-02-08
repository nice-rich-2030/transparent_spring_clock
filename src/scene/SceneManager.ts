import * as THREE from 'three';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    this.setupLighting();
  }

  private setupLighting(): void {
    // Higher ambient for overall coverage
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    // Hemisphere light for natural wide fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444466, 1);
    this.scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x6495ed, 0.4);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Wider-reaching point lights (increase distance parameter)
    const topLight = new THREE.PointLight(0xffffff, 0.5, 30);
    topLight.position.set(0, 8, 0);
    this.scene.add(topLight);

    const frontLight = new THREE.PointLight(0xffd700, 0.3, 30);
    frontLight.position.set(0, 0, 8);
    this.scene.add(frontLight);

    const backLight = new THREE.PointLight(0x4169e1, 0.3, 30);
    backLight.position.set(0, 0, -6);
    this.scene.add(backLight);

    // Side fill lights for wider coverage
    const leftLight = new THREE.PointLight(0xffffff, 0.25, 30);
    leftLight.position.set(-6, 2, 2);
    this.scene.add(leftLight);

    const rightLight = new THREE.PointLight(0xffffff, 0.25, 30);
    rightLight.position.set(6, 2, 2);
    this.scene.add(rightLight);
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  updateAspect(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }
}
