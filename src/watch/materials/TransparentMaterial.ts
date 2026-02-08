import * as THREE from 'three';

export class TransparentMaterial {
  static createGlassMaterial(color: number = 0xffffff): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.5,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  static createMetalMaterial(color: number = 0xc0c0c0): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.5
    });
  }

  static createGoldMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 2.0
    });
  }

  static createRubyMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xe31b23,
      metalness: 0.0,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.3,
      transparent: true,
      opacity: 0.6,
      emissive: 0xe31b23,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  static createCircuitMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x1a5f1a,
      metalness: 0.3,
      roughness: 0.6,
      transparent: true,
      opacity: 0.8,
      emissive: 0x00ff00,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  static createQuartzMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.2,
      transparent: true,
      opacity: 0.4,
      emissive: 0x88ccff,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  static createCoilMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xb87333,
      metalness: 0.95,
      roughness: 0.3,
      transparent: true,
      opacity: 0.5,
      emissive: 0x4169e1,
      emissiveIntensity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  static createMagnetMaterial(pole: 'N' | 'S'): THREE.MeshPhysicalMaterial {
    const color = pole === 'N' ? 0x8a7060 : 0x506878;
    return new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  static createDialMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.1,
      roughness: 0.8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  static createHandMaterial(color: number = 0xc0c0c0): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.95,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 2.0
    });
  }

  static createSpringMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xc0c0c8,
      metalness: 0.92,
      roughness: 0.2,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.5
    });
  }

  static createCaseMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0x888888,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.5
    });
  }
}
