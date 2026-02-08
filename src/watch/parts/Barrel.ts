import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

export class Barrel {
  private group: THREE.Group;
  private mainspring: THREE.Mesh;
  private barrelCase: THREE.Mesh;
  private springRotation: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'barrel';

    this.barrelCase = this.createBarrelCase();
    this.mainspring = this.createMainspring();
    const gearRing = this.createGearRing();

    this.group.add(this.barrelCase);
    this.group.add(this.mainspring);
    this.group.add(gearRing);

    // Gear ring outer r=0.286 meshes with center wheel pinion r=0.03
    // Distance to center (0,0) = 0.316
    this.group.position.set(-0.32, 0, -0.12);
  }

  private createBarrelCase(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.234, 0.234, 0.078, 32);
    const material = TransparentMaterial.createMetalMaterial(0xa0a0a0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.name = 'barrel';
    mesh.renderOrder = 10;
    return mesh;
  }

  private createGearRing(): THREE.Mesh {
    const teeth = 56;
    const outerRadius = 0.286;
    const toothHeight = outerRadius * 0.10;
    const shape = new THREE.Shape();

    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const nextAngle = ((i + 0.4) / teeth) * Math.PI * 2;
      const midAngle = ((i + 0.5) / teeth) * Math.PI * 2;
      const endAngle = ((i + 1) / teeth) * Math.PI * 2;

      const baseR = outerRadius - toothHeight;
      const tipR = outerRadius;

      if (i === 0) {
        shape.moveTo(Math.cos(angle) * baseR, Math.sin(angle) * baseR);
      }

      shape.lineTo(Math.cos(angle) * baseR, Math.sin(angle) * baseR);
      shape.lineTo(Math.cos(nextAngle) * tipR, Math.sin(nextAngle) * tipR);
      shape.lineTo(Math.cos(midAngle) * tipR, Math.sin(midAngle) * tipR);
      shape.lineTo(Math.cos(endAngle) * baseR, Math.sin(endAngle) * baseR);
    }

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, outerRadius * 0.82, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: false
    });
    geometry.center();

    const material = TransparentMaterial.createMetalMaterial(0xb0b0b0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'barrel_gear';
    mesh.renderOrder = 12;
    return mesh;
  }

  private createMainspring(): THREE.Mesh {
    const points: THREE.Vector3[] = [];
    const turns = 20;
    const startRadius = 0.05;
    const endRadius = 0.21;
    const segments = 500;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const radius = startRadius + (endRadius - startRadius) * t;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 500, 0.003, 6, false);
    const material = TransparentMaterial.createSpringMaterial();
    const mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.name = 'mainspring';
    mesh.renderOrder = 11;
    return mesh;
  }

  update(deltaTime: number): void {
    this.springRotation += deltaTime * 0.05;
    this.mainspring.rotation.z = this.springRotation;
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const barrelInfo = PART_DESCRIPTIONS.barrel;
    const mainspringInfo = PART_DESCRIPTIONS.mainspring;

    return [
      {
        id: 'barrel',
        name: barrelInfo.name,
        nameEn: barrelInfo.nameEn,
        mesh: this.barrelCase,
        description: barrelInfo.description
      },
      {
        id: 'mainspring',
        name: mainspringInfo.name,
        nameEn: mainspringInfo.nameEn,
        mesh: this.mainspring,
        description: mainspringInfo.description
      }
    ];
  }
}
