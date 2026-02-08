import * as THREE from 'three';
import { DebugPanel } from './DebugPanel';
import { WatchAssembly } from '../watch/WatchAssembly';
import { CameraController } from '../controls/CameraController';
import { AppConfig } from '../types';

const MENU_HIDE_DELAY = 3000;
const IGNORED_PART_IDS = ['crystal', 'backCase', 'dial', 'caseRing'];

export class UIManager {
  private debugPanel: DebugPanel;
  private timeElement: HTMLElement;
  private helpDialog: HTMLElement;
  private settingsDialog: HTMLElement;
  private autoRotateButton: HTMLElement;
  private header: HTMLElement;
  private footer: HTMLElement;
  private tooltip: HTMLElement;
  private tooltipTitle: HTMLElement;
  private tooltipDescription: HTMLElement;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private watchAssembly: WatchAssembly | null = null;
  private cameraController: CameraController | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private canvas: HTMLElement | null = null;
  private menuHideTimer: number | null = null;
  private menuVisible: boolean = false;

  constructor() {
    this.debugPanel = new DebugPanel();
    this.timeElement = document.getElementById('current-time') as HTMLElement;
    this.helpDialog = document.getElementById('help-dialog') as HTMLElement;
    this.settingsDialog = document.getElementById('settings-dialog') as HTMLElement;
    this.autoRotateButton = document.getElementById('btn-auto-rotate') as HTMLElement;
    this.header = document.getElementById('header') as HTMLElement;
    this.footer = document.getElementById('footer') as HTMLElement;
    this.tooltip = document.getElementById('tooltip') as HTMLElement;
    this.tooltipTitle = document.getElementById('tooltip-title') as HTMLElement;
    this.tooltipDescription = document.getElementById('tooltip-description') as HTMLElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.getElementById('btn-help')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.helpDialog.classList.remove('hidden');
    });

    document.getElementById('btn-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.settingsDialog.classList.remove('hidden');
    });

    this.helpDialog.querySelector('.dialog__close')?.addEventListener('click', () => {
      this.helpDialog.classList.add('hidden');
    });

    this.settingsDialog.querySelector('.dialog__close')?.addEventListener('click', () => {
      this.settingsDialog.classList.add('hidden');
    });

    this.helpDialog.addEventListener('click', (e) => {
      if (e.target === this.helpDialog) {
        this.helpDialog.classList.add('hidden');
      }
    });

    this.settingsDialog.addEventListener('click', (e) => {
      if (e.target === this.settingsDialog) {
        this.settingsDialog.classList.add('hidden');
      }
    });

    document.getElementById('btn-front')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cameraController?.setPresetView('front');
      this.resetMenuTimer();
    });

    document.getElementById('btn-back')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cameraController?.setPresetView('back');
      this.resetMenuTimer();
    });

    document.getElementById('btn-side')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cameraController?.setPresetView('side');
      this.resetMenuTimer();
    });

    document.getElementById('btn-movement')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cameraController?.setPresetView('movement');
      this.resetMenuTimer();
    });

    this.autoRotateButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.cameraController) {
        const enabled = this.cameraController.toggleAutoRotate();
        this.autoRotateButton.classList.toggle('active', enabled);
      }
      this.resetMenuTimer();
    });

    // Click anywhere to show/hide menu
    document.addEventListener('click', () => {
      if (this.menuVisible) {
        this.hideMenu();
      } else {
        this.showMenu();
      }
    });

    // Keep menu visible while hovering over header/footer
    this.header.addEventListener('mouseenter', () => this.clearMenuTimer());
    this.footer.addEventListener('mouseenter', () => this.clearMenuTimer());
    this.header.addEventListener('mouseleave', () => this.resetMenuTimer());
    this.footer.addEventListener('mouseleave', () => this.resetMenuTimer());
  }

  // --- Menu auto-show / auto-hide ---

  private showMenu(): void {
    this.menuVisible = true;
    this.header.classList.remove('hidden');
    this.footer.classList.remove('hidden');
    this.resetMenuTimer();
  }

  private hideMenu(): void {
    this.menuVisible = false;
    this.header.classList.add('hidden');
    this.footer.classList.add('hidden');
    this.clearMenuTimer();
  }

  private resetMenuTimer(): void {
    this.clearMenuTimer();
    this.menuHideTimer = window.setTimeout(() => {
      this.hideMenu();
    }, MENU_HIDE_DELAY);
  }

  private clearMenuTimer(): void {
    if (this.menuHideTimer !== null) {
      clearTimeout(this.menuHideTimer);
      this.menuHideTimer = null;
    }
  }

  // --- Setup ---

  setWatchAssembly(assembly: WatchAssembly): void {
    this.watchAssembly = assembly;
  }

  setCameraController(controller: CameraController): void {
    this.cameraController = controller;
    this.camera = controller.getCamera();
  }

  setCanvas(canvas: HTMLElement): void {
    this.canvas = canvas;
    canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
    canvas.addEventListener('mouseleave', this.onCanvasMouseLeave.bind(this));
  }

  setScene(scene: THREE.Scene): void {
    this.debugPanel.setScene(scene);
  }

  // --- Hover tooltip ---

  private onCanvasMouseMove(event: MouseEvent): void {
    if (!this.watchAssembly || !this.camera || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes: THREE.Object3D[] = [];
    this.watchAssembly.getGroup().traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        meshes.push(obj);
      }
    });

    const intersects = this.raycaster.intersectObjects(meshes, false);

    let foundPart = false;
    for (const intersect of intersects) {
      const hitObject = intersect.object;
      const part = this.watchAssembly.findPartByMesh(hitObject);

      if (part && !IGNORED_PART_IDS.includes(part.id)) {
        this.watchAssembly.resetHighlight();
        this.watchAssembly.highlightPart(part);

        this.tooltipTitle.textContent = part.name;
        this.tooltipDescription.textContent = part.description;
        this.tooltip.classList.remove('hidden');

        const tooltipX = event.clientX + 16;
        const tooltipY = event.clientY + 16;
        const maxX = window.innerWidth - 300;
        const maxY = window.innerHeight - 120;
        this.tooltip.style.left = `${Math.min(tooltipX, maxX)}px`;
        this.tooltip.style.top = `${Math.min(tooltipY, maxY)}px`;

        foundPart = true;
        break;
      }
    }

    if (!foundPart) {
      this.tooltip.classList.add('hidden');
      this.watchAssembly.resetHighlight();
    }
  }

  private onCanvasMouseLeave(): void {
    this.tooltip.classList.add('hidden');
    this.watchAssembly?.resetHighlight();
  }

  // --- Updates ---

  updateTime(formattedTime: string): void {
    this.timeElement.textContent = formattedTime;
  }

  updateFps(fps: number): void {
    this.debugPanel.updateFps(fps);
  }

  setOnConfigChange(callback: (config: Partial<AppConfig>) => void): void {
    this.debugPanel.setOnConfigChange(callback);
  }

  getConfig(): AppConfig {
    return this.debugPanel.getConfig();
  }
}
