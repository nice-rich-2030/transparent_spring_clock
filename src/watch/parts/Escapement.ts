import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

export class Escapement {
  private group: THREE.Group;
  private escapeWheel: THREE.Mesh;
  private anchor: THREE.Group;
  private palletStones: THREE.Mesh[] = [];
  private time: number = 0;
  private readonly frequency: number = 4;
  private readonly amplitude: number = Math.PI / 22;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'escapement';

    this.escapeWheel = this.createEscapeWheel();
    this.anchor = this.createAnchor();

    this.group.add(this.escapeWheel);
    this.group.add(this.anchor);
    this.group.add(this.createPinion());

    // 4th wheel (0.30, 0.01) outer r=0.10 + escape pinion r=0.018 = 0.118
    this.group.position.set(0.40, 0.07, -0.04);
  }

  private createEscapeWheel(): THREE.Mesh {
    const shape = new THREE.Shape();
    const teeth = 20;
    const outerRadius = 0.08;
    const innerRadius = 0.025;
    const toothAngle = (Math.PI * 2) / teeth;

    for (let i = 0; i < teeth; i++) {
      const startAngle = i * toothAngle;
      const peakAngle = startAngle + toothAngle * 0.3;
      const endAngle = startAngle + toothAngle * 0.9;

      const r1 = innerRadius + (outerRadius - innerRadius) * 0.6;
      const r2 = outerRadius;
      const r3 = innerRadius + (outerRadius - innerRadius) * 0.5;

      if (i === 0) {
        shape.moveTo(Math.cos(startAngle) * r1, Math.sin(startAngle) * r1);
      }
      shape.lineTo(Math.cos(peakAngle) * r2, Math.sin(peakAngle) * r2);
      shape.lineTo(Math.cos(endAngle) * r3, Math.sin(endAngle) * r3);
      shape.lineTo(Math.cos((i + 1) * toothAngle) * r1, Math.sin((i + 1) * toothAngle) * r1);
    }

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, 0.01, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: 0.012,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const material = TransparentMaterial.createMetalMaterial(0xc8c8c8);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'gear_escape';
    mesh.renderOrder = 35;

    return mesh;
  }

  private createPinion(): THREE.Mesh {
    const pinionRadius = 0.018;
    const pinionTeeth = 8;
    const toothHeight = pinionRadius * 0.25;
    const innerRadius = pinionRadius * 0.35;
    const shape = new THREE.Shape();

    for (let i = 0; i < pinionTeeth; i++) {
      const angle = (i / pinionTeeth) * Math.PI * 2;
      const nextAngle = ((i + 0.3) / pinionTeeth) * Math.PI * 2;
      const midAngle = ((i + 0.5) / pinionTeeth) * Math.PI * 2;
      const endAngle = ((i + 1) / pinionTeeth) * Math.PI * 2;

      const baseR = pinionRadius - toothHeight;
      const tipR = pinionRadius;

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
      depth: 0.012,
      bevelEnabled: false
    });
    geometry.center();

    const material = TransparentMaterial.createMetalMaterial(0xd0d0d0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'escape_pinion';
    mesh.position.z = -0.015;
    mesh.renderOrder = 34;
    return mesh;
  }

  private createAnchor(): THREE.Group {
    const anchorGroup = new THREE.Group();
    anchorGroup.name = 'anchor';

    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 0.02);
    bodyShape.lineTo(-0.04, 0.08);
    bodyShape.lineTo(-0.035, 0.09);
    bodyShape.lineTo(0, 0.035);
    bodyShape.lineTo(0.035, 0.09);
    bodyShape.lineTo(0.04, 0.08);
    bodyShape.lineTo(0, 0.02);

    const extrudeSettings = {
      depth: 0.008,
      bevelEnabled: false
    };

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeometry.center();
    const bodyMaterial = TransparentMaterial.createMetalMaterial(0xb0b0b0);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.12;
    body.renderOrder = 36;
    anchorGroup.add(body);

    const palletGeometry = new THREE.BoxGeometry(0.015, 0.008, 0.012);
    const palletMaterial = TransparentMaterial.createRubyMaterial();

    const leftPallet = new THREE.Mesh(palletGeometry, palletMaterial);
    leftPallet.position.set(-0.035, 0.16, 0);
    leftPallet.rotation.z = Math.PI / 6;
    leftPallet.name = 'pallet_stones';
    leftPallet.renderOrder = 37;
    this.palletStones.push(leftPallet);
    anchorGroup.add(leftPallet);

    const rightPallet = new THREE.Mesh(palletGeometry, palletMaterial.clone());
    rightPallet.position.set(0.035, 0.16, 0);
    rightPallet.rotation.z = -Math.PI / 6;
    rightPallet.name = 'pallet_stones';
    rightPallet.renderOrder = 37;
    this.palletStones.push(rightPallet);
    anchorGroup.add(rightPallet);

    const pivotGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 16);
    const pivotMaterial = TransparentMaterial.createMetalMaterial();
    const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
    pivot.position.y = 0.12;
    pivot.rotation.x = Math.PI / 2;
    pivot.renderOrder = 36;
    anchorGroup.add(pivot);

    return anchorGroup;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    const oscillation = Math.sin(this.time * this.frequency * Math.PI * 2);
    this.anchor.rotation.z = oscillation * this.amplitude;

    const escapeSpeed = 0.5;
    this.escapeWheel.rotation.z -= deltaTime * escapeSpeed;

    const brightness = (Math.abs(oscillation) > 0.9) ? 0.8 : 0.3;
    for (const pallet of this.palletStones) {
      const material = pallet.material as THREE.MeshPhysicalMaterial;
      material.emissiveIntensity = brightness;
    }
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const escapeInfo = PART_DESCRIPTIONS.gear_escape;
    const anchorInfo = PART_DESCRIPTIONS.anchor;
    const palletInfo = PART_DESCRIPTIONS.pallet_stones;

    return [
      {
        id: 'gear_escape',
        name: escapeInfo.name,
        nameEn: escapeInfo.nameEn,
        mesh: this.escapeWheel,
        description: escapeInfo.description
      },
      {
        id: 'anchor',
        name: anchorInfo.name,
        nameEn: anchorInfo.nameEn,
        mesh: this.anchor,
        description: anchorInfo.description
      },
      {
        id: 'pallet_stones',
        name: palletInfo.name,
        nameEn: palletInfo.nameEn,
        mesh: this.palletStones[0],
        description: palletInfo.description
      }
    ];
  }
}
