import * as THREE from 'three';
import { WatchPart, PART_DESCRIPTIONS, TimeState } from '../../types';
import { TransparentMaterial } from '../materials/TransparentMaterial';

export class Hands {
  private group: THREE.Group;
  private hourHand: THREE.Mesh;
  private minuteHand: THREE.Mesh;
  private secondHand: THREE.Mesh;
  private centerPivot: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'hands';

    this.hourHand = this.createHourHand();
    this.minuteHand = this.createMinuteHand();
    this.secondHand = this.createSecondHand();
    this.centerPivot = this.createCenterPivot();

    this.group.add(this.hourHand);
    this.group.add(this.minuteHand);
    this.group.add(this.secondHand);
    this.group.add(this.centerPivot);

    this.group.position.set(0, 0, 0.08);
  }

  private createHourHand(): THREE.Mesh {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.03);
    shape.lineTo(-0.015, 0);
    shape.lineTo(-0.01, 0.35);
    shape.lineTo(0, 0.38);
    shape.lineTo(0.01, 0.35);
    shape.lineTo(0.015, 0);
    shape.lineTo(0, -0.03);

    const extrudeSettings = {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.001,
      bevelSize: 0.001,
      bevelSegments: 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.translate(0, 0.15, 0);

    const material = TransparentMaterial.createHandMaterial(0xe0e0e0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'hour_hand';
    mesh.position.z = 0.01;
    mesh.renderOrder = 100;

    return mesh;
  }

  private createMinuteHand(): THREE.Mesh {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.04);
    shape.lineTo(-0.012, 0);
    shape.lineTo(-0.006, 0.5);
    shape.lineTo(0, 0.55);
    shape.lineTo(0.006, 0.5);
    shape.lineTo(0.012, 0);
    shape.lineTo(0, -0.04);

    const extrudeSettings = {
      depth: 0.008,
      bevelEnabled: true,
      bevelThickness: 0.001,
      bevelSize: 0.001,
      bevelSegments: 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.translate(0, 0.22, 0);

    const material = TransparentMaterial.createHandMaterial(0xe0e0e0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'minute_hand';
    mesh.position.z = 0.02;
    mesh.renderOrder = 101;

    return mesh;
  }

  private createSecondHand(): THREE.Mesh {
    const group = new THREE.Group();
    group.name = 'second_hand';

    const shaftGeometry = new THREE.BoxGeometry(0.003, 0.65, 0.004);
    const shaftMaterial = TransparentMaterial.createHandMaterial(0xc0c0c0);
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 0.22;
    shaft.renderOrder = 102;
    group.add(shaft);

    const tipGeometry = new THREE.ConeGeometry(0.008, 0.04, 8);
    const tipMaterial = TransparentMaterial.createHandMaterial(0xff4444);
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.y = 0.55;
    tip.renderOrder = 102;
    group.add(tip);

    const counterweightGeometry = new THREE.CircleGeometry(0.015, 16);
    const counterweightMaterial = TransparentMaterial.createHandMaterial(0xff4444);
    const counterweight = new THREE.Mesh(counterweightGeometry, counterweightMaterial);
    counterweight.position.y = -0.08;
    counterweight.renderOrder = 102;
    group.add(counterweight);

    const mesh = new THREE.Mesh();
    mesh.add(group);
    mesh.position.z = 0.03;

    return mesh as unknown as THREE.Mesh;
  }

  private createCenterPivot(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 16);
    geometry.rotateX(Math.PI / 2);
    const material = TransparentMaterial.createMetalMaterial(0xd0d0d0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 0.015;
    mesh.renderOrder = 103;
    return mesh;
  }

  update(timeState: TimeState): void {
    const hours12 = timeState.hours % 12;
    const hourAngle = -((hours12 + timeState.minutes / 60) / 12) * Math.PI * 2;
    this.hourHand.rotation.z = hourAngle;

    const minuteAngle = -((timeState.minutes + timeState.seconds / 60) / 60) * Math.PI * 2;
    this.minuteHand.rotation.z = minuteAngle;

    const secondAngle = -(timeState.seconds / 60) * Math.PI * 2;
    this.secondHand.rotation.z = secondAngle;
  }

  getMesh(): THREE.Group {
    return this.group;
  }

  getPartInfo(): WatchPart[] {
    const hourInfo = PART_DESCRIPTIONS.hour_hand;
    const minuteInfo = PART_DESCRIPTIONS.minute_hand;
    const secondInfo = PART_DESCRIPTIONS.second_hand;

    return [
      {
        id: 'hour_hand',
        name: hourInfo.name,
        nameEn: hourInfo.nameEn,
        mesh: this.hourHand,
        description: hourInfo.description
      },
      {
        id: 'minute_hand',
        name: minuteInfo.name,
        nameEn: minuteInfo.nameEn,
        mesh: this.minuteHand,
        description: minuteInfo.description
      },
      {
        id: 'second_hand',
        name: secondInfo.name,
        nameEn: secondInfo.nameEn,
        mesh: this.secondHand,
        description: secondInfo.description
      }
    ];
  }
}
