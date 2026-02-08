import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

interface GearConfig {
  id: string;
  teeth: number;
  radius: number;
  pinionTeeth: number;
  pinionRadius: number;
  thickness: number;
  position: THREE.Vector3;
  gearRatio: number;
  direction: 1 | -1;
}

export class GearTrain {
  private group: THREE.Group;
  private gears: Map<string, { mesh: THREE.Mesh; config: GearConfig }> = new Map();
  private baseRotation: number = 0;

  // Each gear has outer teeth (wheel) and inner teeth (pinion / カナ).
  // Power flows: prev wheel outer teeth → next gear pinion (カナ).
  // Distance between centers = prev wheel radius + next pinion radius.
  //
  //   Barrel(r=0.22)  →  Center pinion(0.03)  = 0.25
  //   Center(r=0.18)  →  Third pinion(0.025)  = 0.205
  //   Third(r=0.12)   →  Fourth pinion(0.022) = 0.142
  //   Fourth(r=0.10)  →  Escape pinion(0.018) = 0.118  (in Escapement class)
  //
  // Gear ratios relative to center wheel (1 rev/hour):
  //   center: 1 rev/hr (minute hand)
  //   third:  8 rev/hr
  //   fourth: 60 rev/hr = 1 rev/min
  private readonly gearConfigs: GearConfig[] = [
    { id: 'gear_center', teeth: 80, radius: 0.18, pinionTeeth: 10, pinionRadius: 0.03,  thickness: 0.025, position: new THREE.Vector3(0, 0, -0.10),       gearRatio: 1,  direction: 1 },
    { id: 'gear_third',  teeth: 75, radius: 0.12, pinionTeeth: 10, pinionRadius: 0.025, thickness: 0.02,  position: new THREE.Vector3(0.18, 0.09, -0.08),  gearRatio: 8,  direction: -1 },
    { id: 'gear_fourth', teeth: 80, radius: 0.10, pinionTeeth: 10, pinionRadius: 0.022, thickness: 0.02,  position: new THREE.Vector3(0.30, 0.01, -0.06),  gearRatio: 60, direction: 1 }
  ];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'gearTrain';

    for (const config of this.gearConfigs) {
      const gearMesh = this.createGear(config);
      this.gears.set(config.id, { mesh: gearMesh, config });
      this.group.add(gearMesh);
    }

    this.addJewelBearings();
  }

  private createGear(config: GearConfig): THREE.Mesh {
    // --- Wheel (outer teeth) ---
    const shape = new THREE.Shape();
    const innerRadius = config.radius * 0.3;
    const toothHeight = config.radius * 0.12;

    for (let i = 0; i < config.teeth; i++) {
      const angle = (i / config.teeth) * Math.PI * 2;
      const nextAngle = ((i + 0.4) / config.teeth) * Math.PI * 2;
      const midAngle = ((i + 0.5) / config.teeth) * Math.PI * 2;
      const endAngle = ((i + 1) / config.teeth) * Math.PI * 2;

      const baseR = config.radius - toothHeight;
      const tipR = config.radius;

      if (i === 0) {
        shape.moveTo(Math.cos(angle) * baseR, Math.sin(angle) * baseR);
      }

      shape.lineTo(Math.cos(angle) * baseR, Math.sin(angle) * baseR);
      shape.lineTo(Math.cos(nextAngle) * tipR, Math.sin(nextAngle) * tipR);
      shape.lineTo(Math.cos(midAngle) * tipR, Math.sin(midAngle) * tipR);
      shape.lineTo(Math.cos(endAngle) * baseR, Math.sin(endAngle) * baseR);
    }

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: config.thickness,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const material = TransparentMaterial.createMetalMaterial(0xb8b8b8);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(config.position);
    mesh.name = config.id;
    mesh.renderOrder = 20 + this.gearConfigs.indexOf(config);

    // --- Axle (longer to connect wheel and pinion) ---
    const axle = this.createAxle(config.thickness * 3);
    mesh.add(axle);

    // --- Pinion (カナ) on the same axle, offset behind the wheel ---
    const pinion = this.createPinion(config);
    pinion.position.z = -(config.thickness / 2 + 0.008);
    mesh.add(pinion);

    return mesh;
  }

  private createPinion(config: GearConfig): THREE.Mesh {
    const shape = new THREE.Shape();
    const toothHeight = config.pinionRadius * 0.25;
    const innerRadius = config.pinionRadius * 0.35;

    for (let i = 0; i < config.pinionTeeth; i++) {
      const angle = (i / config.pinionTeeth) * Math.PI * 2;
      const nextAngle = ((i + 0.3) / config.pinionTeeth) * Math.PI * 2;
      const midAngle = ((i + 0.5) / config.pinionTeeth) * Math.PI * 2;
      const endAngle = ((i + 1) / config.pinionTeeth) * Math.PI * 2;

      const baseR = config.pinionRadius - toothHeight;
      const tipR = config.pinionRadius;

      if (i === 0) {
        shape.moveTo(Math.cos(angle) * baseR, Math.sin(angle) * baseR);
      }

      shape.lineTo(Math.cos(angle) * baseR, Math.sin(angle) * baseR);
      shape.lineTo(Math.cos(nextAngle) * tipR, Math.sin(nextAngle) * tipR);
      shape.lineTo(Math.cos(midAngle) * tipR, Math.sin(midAngle) * tipR);
      shape.lineTo(Math.cos(endAngle) * baseR, Math.sin(endAngle) * baseR);
    }

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.015,
      bevelEnabled: false
    });
    geometry.center();

    const material = TransparentMaterial.createMetalMaterial(0xd0d0d0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = config.id + '_pinion';
    mesh.renderOrder = 26;

    return mesh;
  }

  private createAxle(height: number): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.012, 0.012, height, 16);
    geometry.rotateX(Math.PI / 2);
    const material = TransparentMaterial.createMetalMaterial(0xd0d0d0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 25;
    return mesh;
  }

  private addJewelBearings(): void {
    const jewelGeometry = new THREE.SphereGeometry(0.012, 16, 16);
    const jewelMaterial = TransparentMaterial.createRubyMaterial();

    for (const config of this.gearConfigs) {
      const jewel = new THREE.Mesh(jewelGeometry, jewelMaterial);
      jewel.position.set(
        config.position.x,
        config.position.y,
        config.position.z + config.thickness / 2 + 0.015
      );
      jewel.name = 'jewel';
      jewel.renderOrder = 30;
      this.group.add(jewel);

      const jewelBack = jewel.clone();
      jewelBack.position.z = config.position.z - config.thickness / 2 - 0.015;
      this.group.add(jewelBack);
    }
  }

  update(totalSeconds: number): void {
    this.baseRotation = (totalSeconds / 3600) * Math.PI * 2;

    for (const [, gear] of this.gears) {
      const rotation = this.baseRotation * gear.config.gearRatio * gear.config.direction;
      gear.mesh.rotation.z = rotation;
    }
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const parts: WatchPart[] = [];

    for (const [id, gear] of this.gears) {
      const info = PART_DESCRIPTIONS[id];
      if (info) {
        parts.push({
          id: id,
          name: info.name,
          nameEn: info.nameEn,
          mesh: gear.mesh,
          description: info.description
        });
      }
    }

    const jewelInfo = PART_DESCRIPTIONS.jewel;
    parts.push({
      id: 'jewel',
      name: jewelInfo.name,
      nameEn: jewelInfo.nameEn,
      mesh: this.group,
      description: jewelInfo.description
    });

    return parts;
  }
}
