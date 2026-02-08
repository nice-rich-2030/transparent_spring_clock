import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

export class Case {
  private group: THREE.Group;
  private dial: THREE.Group;
  private caseRing: THREE.Mesh;
  private crystal: THREE.Mesh;
  private backCase: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'case';

    this.dial = this.createDial();
    this.caseRing = this.createCaseRing();
    this.crystal = this.createCrystal();
    this.backCase = this.createBackCase();

    this.group.add(this.dial);
    this.group.add(this.caseRing);
    this.group.add(this.crystal);
    this.group.add(this.backCase);
  }

  private createDial(): THREE.Group {
    const dialGroup = new THREE.Group();
    dialGroup.name = 'dial';

    const baseGeometry = new THREE.CircleGeometry(0.7, 64);
    const baseMaterial = TransparentMaterial.createDialMaterial();
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.z = 0.05;
    base.renderOrder = 1;
    dialGroup.add(base);

    const indexMaterial = TransparentMaterial.createMetalMaterial(0xe0e0e0);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const isMainHour = i % 3 === 0;

      const width = isMainHour ? 0.025 : 0.015;
      const height = isMainHour ? 0.08 : 0.05;
      const indexGeometry = new THREE.BoxGeometry(width, height, 0.01);
      const index = new THREE.Mesh(indexGeometry, indexMaterial);

      const radius = 0.6;
      index.position.x = Math.cos(angle) * radius;
      index.position.y = Math.sin(angle) * radius;
      index.position.z = 0.06;
      index.rotation.z = angle + Math.PI / 2;
      index.renderOrder = 2;
      dialGroup.add(index);
    }

    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;

      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const dotGeometry = new THREE.CircleGeometry(0.006, 8);
      const dot = new THREE.Mesh(dotGeometry, indexMaterial);

      const radius = 0.62;
      dot.position.x = Math.cos(angle) * radius;
      dot.position.y = Math.sin(angle) * radius;
      dot.position.z = 0.06;
      dot.renderOrder = 2;
      dialGroup.add(dot);
    }

    const innerRingGeometry = new THREE.RingGeometry(0.15, 0.18, 32);
    const innerRingMaterial = TransparentMaterial.createMetalMaterial(0xc0c0c0);
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    innerRing.position.z = 0.055;
    innerRing.renderOrder = 2;
    dialGroup.add(innerRing);

    return dialGroup;
  }

  private createCaseRing(): THREE.Mesh {
    const geometry = new THREE.TorusGeometry(0.75, 0.08, 16, 64);
    const material = TransparentMaterial.createCaseMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'case';
    mesh.renderOrder = 0;
    return mesh;
  }

  private createCrystal(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.72, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    geometry.scale(1, 1, 0.15);
    const material = TransparentMaterial.createGlassMaterial();
    material.transmission = 0.98;
    material.opacity = 0.15;
    material.roughness = 0.02;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 0.1;
    mesh.name = 'crystal';
    mesh.renderOrder = 200;
    return mesh;
  }

  private createBackCase(): THREE.Mesh {
    const geometry = new THREE.CircleGeometry(0.72, 64);
    const material = TransparentMaterial.createGlassMaterial();
    material.transmission = 0.9;
    material.opacity = 0.2;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -0.2;
    mesh.rotation.y = Math.PI;
    mesh.name = 'backCase';
    mesh.renderOrder = 0;
    return mesh;
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const dialInfo = PART_DESCRIPTIONS.dial;
    const caseInfo = PART_DESCRIPTIONS.case;
    const crystalInfo = PART_DESCRIPTIONS.crystal;

    return [
      {
        id: 'dial',
        name: dialInfo.name,
        nameEn: dialInfo.nameEn,
        mesh: this.dial,
        description: dialInfo.description
      },
      {
        id: 'case',
        name: caseInfo.name,
        nameEn: caseInfo.nameEn,
        mesh: this.caseRing,
        description: caseInfo.description
      },
      {
        id: 'crystal',
        name: crystalInfo.name,
        nameEn: crystalInfo.nameEn,
        mesh: this.crystal,
        description: crystalInfo.description
      }
    ];
  }
}
