import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

export class Generator {
  private group: THREE.Group;
  private rotor: THREE.Group;
  private coil: THREE.Mesh;
  private coilMaterial: THREE.MeshPhysicalMaterial;
  private time: number = 0;
  private rotorSpeed: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'generator';

    this.rotor = this.createRotor();
    const coilResult = this.createCoil();
    this.coil = coilResult.mesh;
    this.coilMaterial = coilResult.material;

    this.group.add(this.rotor);
    this.group.add(this.coil);

    // Left side, above barrel (-0.32, 0, gear r=0.286)
    this.group.position.set(-0.52, 0.28, -0.05);
  }

  private createRotor(): THREE.Group {
    const rotorGroup = new THREE.Group();
    rotorGroup.name = 'rotor';

    const halfShape = new THREE.Shape();
    halfShape.moveTo(0, -0.06);
    halfShape.absarc(0, 0, 0.06, -Math.PI / 2, Math.PI / 2, false);
    halfShape.lineTo(0, -0.06);

    const extrudeSettings = {
      depth: 0.015,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2
    };

    const halfGeometry = new THREE.ExtrudeGeometry(halfShape, extrudeSettings);
    halfGeometry.center();

    const northMaterial = TransparentMaterial.createMagnetMaterial('N');
    const northHalf = new THREE.Mesh(halfGeometry, northMaterial);
    northHalf.position.x = 0.03;
    northHalf.renderOrder = 50;
    rotorGroup.add(northHalf);

    const southMaterial = TransparentMaterial.createMagnetMaterial('S');
    const southHalf = new THREE.Mesh(halfGeometry, southMaterial);
    southHalf.position.x = -0.03;
    southHalf.rotation.y = Math.PI;
    southHalf.renderOrder = 50;
    rotorGroup.add(southHalf);

    const axisGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 16);
    const axisMaterial = TransparentMaterial.createMetalMaterial();
    const axis = new THREE.Mesh(axisGeometry, axisMaterial);
    axis.rotation.x = Math.PI / 2;
    axis.renderOrder = 51;
    rotorGroup.add(axis);

    return rotorGroup;
  }

  private createCoil(): { mesh: THREE.Mesh; material: THREE.MeshPhysicalMaterial } {
    const coilGroup = new THREE.Group();
    coilGroup.name = 'coil';

    const material = TransparentMaterial.createCoilMaterial();

    const torusGeometry = new THREE.TorusGeometry(0.04, 0.008, 8, 24);

    for (let i = 0; i < 5; i++) {
      const coilRing = new THREE.Mesh(torusGeometry, material);
      coilRing.position.z = (i - 2) * 0.006;
      coilRing.scale.set(1 + i * 0.05, 1 + i * 0.05, 1);
      coilRing.renderOrder = 52;
      coilGroup.add(coilRing);
    }

    coilGroup.position.y = -0.12;

    const mesh = new THREE.Mesh();
    mesh.add(coilGroup);

    return { mesh: mesh as unknown as THREE.Mesh, material };
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    this.rotorSpeed = 8;
    this.rotor.rotation.z += deltaTime * this.rotorSpeed * Math.PI * 2;

    const brakeStrength = (Math.sin(this.time * 10) + 1) / 2;

    const blue = new THREE.Color(0x4169e1);
    const white = new THREE.Color(0xffffff);
    const orange = new THREE.Color(0xff8c00);

    let color: THREE.Color;
    if (brakeStrength < 0.5) {
      color = blue.clone().lerp(white, brakeStrength * 2);
    } else {
      color = white.clone().lerp(orange, (brakeStrength - 0.5) * 2);
    }

    this.coilMaterial.emissive = color;
    this.coilMaterial.emissiveIntensity = brakeStrength * 0.02
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const rotorInfo = PART_DESCRIPTIONS.rotor;
    const coilInfo = PART_DESCRIPTIONS.coil;

    return [
      {
        id: 'rotor',
        name: rotorInfo.name,
        nameEn: rotorInfo.nameEn,
        mesh: this.rotor,
        description: rotorInfo.description
      },
      {
        id: 'coil',
        name: coilInfo.name,
        nameEn: coilInfo.nameEn,
        mesh: this.coil,
        description: coilInfo.description
      }
    ];
  }
}
