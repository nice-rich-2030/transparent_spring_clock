import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

export class Balance {
  private group: THREE.Group;
  private balanceWheel: THREE.Mesh;
  private hairspring: THREE.Mesh;
  private time: number = 0;
  private readonly frequency: number = 4;
  private readonly amplitude: number = Math.PI * 1.5;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'balance';

    this.balanceWheel = this.createBalanceWheel();
    this.hairspring = this.createHairspring();

    this.group.add(this.balanceWheel);
    this.group.add(this.hairspring);

    // Above escapement (0.40, 0.07), connected via anchor
    this.group.position.set(0.40, 0.27, 0.00);
  }

  private createBalanceWheel(): THREE.Mesh {
    const group = new THREE.Group();

    const rimGeometry = new THREE.TorusGeometry(0.06, 0.008, 8, 32);
    const rimMaterial = TransparentMaterial.createMetalMaterial(0xd4af37);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.renderOrder = 40;
    group.add(rim);

    const spokeGeometry = new THREE.BoxGeometry(0.12, 0.006, 0.004);
    const spokeMaterial = TransparentMaterial.createMetalMaterial(0xc0c0c0);

    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
      spoke.rotation.z = (i / 4) * Math.PI;
      spoke.renderOrder = 41;
      group.add(spoke);
    }

    const hubGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.015, 16);
    const hubMaterial = TransparentMaterial.createMetalMaterial(0xb0b0b0);
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.rotation.x = Math.PI / 2;
    hub.renderOrder = 42;
    group.add(hub);

    const weightGeometry = new THREE.SphereGeometry(0.008, 8, 8);
    const weightMaterial = TransparentMaterial.createGoldMaterial();
    const weightPositions = [
      new THREE.Vector3(0.06, 0, 0),
      new THREE.Vector3(-0.06, 0, 0),
      new THREE.Vector3(0, 0.06, 0),
      new THREE.Vector3(0, -0.06, 0)
    ];

    for (const pos of weightPositions) {
      const weight = new THREE.Mesh(weightGeometry, weightMaterial);
      weight.position.copy(pos);
      weight.renderOrder = 43;
      group.add(weight);
    }

    const mesh = new THREE.Mesh();
    mesh.add(group);
    mesh.name = 'balance';

    return mesh as unknown as THREE.Mesh;
  }

  private createHairspring(): THREE.Mesh {
    const points: THREE.Vector3[] = [];
    const turns = 12;
    const startRadius = 0.008;
    const endRadius = 0.045;
    const segments = 300;

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
    const tubeGeometry = new THREE.TubeGeometry(curve, 300, 0.001, 6, false);
    const material = TransparentMaterial.createSpringMaterial();
    material.color = new THREE.Color(0x6495ed);
    const mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.name = 'hairspring';
    mesh.renderOrder = 44;

    return mesh;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    const oscillation = Math.sin(this.time * this.frequency * Math.PI * 2);
    const rotation = oscillation * this.amplitude;

    this.balanceWheel.rotation.z = rotation;
    this.hairspring.rotation.z = rotation * 0.3;

    const scale = 1 + oscillation * 0.05;
    this.hairspring.scale.set(scale, scale, 1);
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const balanceInfo = PART_DESCRIPTIONS.balance;
    const hairspringInfo = PART_DESCRIPTIONS.hairspring;

    return [
      {
        id: 'balance',
        name: balanceInfo.name,
        nameEn: balanceInfo.nameEn,
        mesh: this.balanceWheel,
        description: balanceInfo.description
      },
      {
        id: 'hairspring',
        name: hairspringInfo.name,
        nameEn: hairspringInfo.nameEn,
        mesh: this.hairspring,
        description: hairspringInfo.description
      }
    ];
  }
}
