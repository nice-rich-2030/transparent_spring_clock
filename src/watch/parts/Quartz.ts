import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

export class Quartz {
  private group: THREE.Group;
  private quartzCrystal: THREE.Mesh;
  private ic: THREE.Mesh;
  private quartzMaterial: THREE.MeshPhysicalMaterial;
  private icMaterial: THREE.MeshStandardMaterial;
  private time: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'quartz';

    const quartzResult = this.createQuartzCrystal();
    this.quartzCrystal = quartzResult.mesh;
    this.quartzMaterial = quartzResult.material;

    const icResult = this.createIC();
    this.ic = icResult.mesh;
    this.icMaterial = icResult.material;

    this.group.add(this.quartzCrystal);
    this.group.add(this.ic);

    // Below-left, away from barrel (-0.25, 0)
    this.group.position.set(-0.12, -0.28, -0.08);
  }

  private createQuartzCrystal(): { mesh: THREE.Mesh; material: THREE.MeshPhysicalMaterial } {
    const group = new THREE.Group();
    group.name = 'quartz';

    const material = TransparentMaterial.createQuartzMaterial();

    const baseGeometry = new THREE.BoxGeometry(0.025, 0.006, 0.008);
    const base = new THREE.Mesh(baseGeometry, material);
    base.position.y = -0.02;
    base.renderOrder = 55;
    group.add(base);

    const prong1Geometry = new THREE.BoxGeometry(0.008, 0.04, 0.006);
    const prong1 = new THREE.Mesh(prong1Geometry, material);
    prong1.position.set(-0.006, 0.01, 0);
    prong1.renderOrder = 56;
    group.add(prong1);

    const prong2 = prong1.clone();
    prong2.position.set(0.006, 0.01, 0);
    group.add(prong2);

    const mesh = new THREE.Mesh();
    mesh.add(group);

    return { mesh: mesh as unknown as THREE.Mesh, material };
  }

  private createIC(): { mesh: THREE.Mesh; material: THREE.MeshStandardMaterial } {
    const group = new THREE.Group();
    group.name = 'ic';

    const material = TransparentMaterial.createCircuitMaterial();

    const chipGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.008);
    const chip = new THREE.Mesh(chipGeometry, material);
    chip.renderOrder = 57;
    group.add(chip);

    const pinGeometry = new THREE.BoxGeometry(0.004, 0.015, 0.003);
    const pinMaterial = TransparentMaterial.createMetalMaterial(0xc0c0c0);

    const pinPositions = [
      { x: -0.015, y: 0.025 },
      { x: -0.005, y: 0.025 },
      { x: 0.005, y: 0.025 },
      { x: 0.015, y: 0.025 },
      { x: -0.015, y: -0.025 },
      { x: -0.005, y: -0.025 },
      { x: 0.005, y: -0.025 },
      { x: 0.015, y: -0.025 }
    ];

    for (const pos of pinPositions) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(pos.x, pos.y, 0);
      pin.renderOrder = 58;
      group.add(pin);
    }

    group.position.y = -0.08;

    const mesh = new THREE.Mesh();
    mesh.add(group);

    return { mesh: mesh as unknown as THREE.Mesh, material };
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    const highFreqOscillation = Math.sin(this.time * 100) * 0.5 + 0.5;
    this.quartzMaterial.emissiveIntensity = 0.3 + highFreqOscillation * 0.4;

    const icPulse = (Math.sin(this.time * 5) + 1) / 2;
    this.icMaterial.emissiveIntensity = 0.1 + icPulse * 0.3;
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const quartzInfo = PART_DESCRIPTIONS.quartz;
    const icInfo = PART_DESCRIPTIONS.ic;

    return [
      {
        id: 'quartz',
        name: quartzInfo.name,
        nameEn: quartzInfo.nameEn,
        mesh: this.quartzCrystal,
        description: quartzInfo.description
      },
      {
        id: 'ic',
        name: icInfo.name,
        nameEn: icInfo.nameEn,
        mesh: this.ic,
        description: icInfo.description
      }
    ];
  }
}
