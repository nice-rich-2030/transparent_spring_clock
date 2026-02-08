import * as THREE from 'three';
import { WatchPart, TimeState } from '../types';
import { Barrel } from './parts/Barrel';
import { GearTrain } from './parts/GearTrain';
import { Escapement } from './parts/Escapement';
import { Balance } from './parts/Balance';
import { Generator } from './parts/Generator';
import { Quartz } from './parts/Quartz';
import { Hands } from './parts/Hands';
import { Case } from './parts/Case';

export class WatchAssembly {
  private group: THREE.Group;
  private barrel: Barrel;
  private gearTrain: GearTrain;
  private escapement: Escapement;
  private balance: Balance;
  private generator: Generator;
  private quartz: Quartz;
  private hands: Hands;
  private case: Case;
  private allParts: WatchPart[] = [];
  private highlightedPart: WatchPart | null = null;
  private originalMaterials: Map<string, THREE.Material> = new Map();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'watchAssembly';

    this.case = new Case();
    this.barrel = new Barrel();
    this.gearTrain = new GearTrain();
    this.escapement = new Escapement();
    this.balance = new Balance();
    this.generator = new Generator();
    this.quartz = new Quartz();
    this.hands = new Hands();

    this.group.add(this.case.getMesh());
    this.group.add(this.barrel.getMesh());
    this.group.add(this.gearTrain.getMesh());
    this.group.add(this.escapement.getMesh());
    this.group.add(this.balance.getMesh());
    this.group.add(this.generator.getMesh());
    this.group.add(this.quartz.getMesh());
    this.group.add(this.hands.getMesh());

    this.collectAllParts();
  }

  private collectAllParts(): void {
    this.allParts = [
      ...this.case.getPartInfo(),
      ...this.barrel.getPartInfo(),
      ...this.gearTrain.getPartInfo(),
      ...this.escapement.getPartInfo(),
      ...this.balance.getPartInfo(),
      ...this.generator.getPartInfo(),
      ...this.quartz.getPartInfo(),
      ...this.hands.getPartInfo()
    ];
  }

  update(deltaTime: number, timeState: TimeState): void {
    this.barrel.update(deltaTime);
    this.gearTrain.update(timeState.totalSeconds);
    this.escapement.update(deltaTime);
    this.balance.update(deltaTime);
    this.generator.update(deltaTime);
    this.quartz.update(deltaTime);
    this.hands.update(timeState);
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  getAllParts(): WatchPart[] {
    return this.allParts;
  }

  getPartById(id: string): WatchPart | undefined {
    return this.allParts.find(part => part.id === id);
  }

  findPartByMesh(mesh: THREE.Object3D): WatchPart | undefined {
    let current: THREE.Object3D | null = mesh;
    while (current) {
      const part = this.allParts.find(p => {
        if (p.mesh === current) return true;
        if (p.mesh instanceof THREE.Group) {
          let found = false;
          p.mesh.traverse(child => {
            if (child === current) found = true;
          });
          return found;
        }
        return false;
      });
      if (part) return part;
      current = current.parent;
    }

    if (mesh.name) {
      return this.allParts.find(p => p.id === mesh.name);
    }

    return undefined;
  }

  highlightPart(part: WatchPart): void {
    this.resetHighlight();

    this.highlightedPart = part;

    const applyHighlight = (object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh && object.material) {
        const material = object.material as THREE.MeshStandardMaterial;
        if (!this.originalMaterials.has(object.uuid)) {
          this.originalMaterials.set(object.uuid, material.clone());
        }
        if ('emissive' in material) {
          material.emissive = new THREE.Color(0x444444);
          material.emissiveIntensity = 1.0;
        }
      }
    };

    if (part.mesh instanceof THREE.Group) {
      part.mesh.traverse(applyHighlight);
    } else {
      applyHighlight(part.mesh);
    }
  }

  resetHighlight(): void {
    if (!this.highlightedPart) return;

    const resetMaterial = (object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh && object.material) {
        const original = this.originalMaterials.get(object.uuid);
        if (original) {
          const current = object.material as THREE.MeshStandardMaterial;
          const orig = original as THREE.MeshStandardMaterial;
          if ('emissive' in current && 'emissive' in orig) {
            current.emissive.copy(orig.emissive);
            current.emissiveIntensity = orig.emissiveIntensity;
          }
        }
      }
    };

    if (this.highlightedPart.mesh instanceof THREE.Group) {
      this.highlightedPart.mesh.traverse(resetMaterial);
    } else {
      resetMaterial(this.highlightedPart.mesh);
    }

    this.highlightedPart = null;
    this.originalMaterials.clear();
  }

  setWireframe(enabled: boolean): void {
    this.group.traverse(object => {
      if (object instanceof THREE.Mesh && object.material) {
        const material = object.material as THREE.Material;
        if ('wireframe' in material) {
          (material as THREE.MeshStandardMaterial).wireframe = enabled;
        }
      }
    });
  }

  dispose(): void {
    this.group.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }
}
