import { SceneManager } from './scene/SceneManager';
import { Renderer } from './scene/Renderer';
import { WatchAssembly } from './watch/WatchAssembly';
import { TimeController } from './time/TimeController';
import { CameraController } from './controls/CameraController';
import { UIManager } from './ui/UIManager';
import { AppConfig } from './types';

class App {
  private sceneManager: SceneManager;
  private renderer: Renderer;
  private watchAssembly: WatchAssembly;
  private timeController: TimeController;
  private cameraController: CameraController;
  private uiManager: UIManager;

  constructor() {
    if (!this.checkWebGLSupport()) {
      this.showWebGLError();
      throw new Error('WebGL not supported');
    }

    const container = document.getElementById('canvas-container') as HTMLElement;

    this.sceneManager = new SceneManager(container);
    this.renderer = new Renderer(this.sceneManager, container);
    this.watchAssembly = new WatchAssembly();
    this.timeController = new TimeController();
    this.cameraController = new CameraController(
      this.sceneManager.getCamera(),
      this.renderer.getRenderer().domElement
    );
    this.uiManager = new UIManager();

    this.init();
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('webgl2'))
      );
    } catch {
      return false;
    }
  }

  private showWebGLError(): void {
    const errorElement = document.getElementById('webgl-error');
    if (errorElement) {
      errorElement.classList.remove('hidden');
    }
  }

  private init(): void {
    this.sceneManager.add(this.watchAssembly.getGroup());

    this.uiManager.setWatchAssembly(this.watchAssembly);
    this.uiManager.setCameraController(this.cameraController);
    this.uiManager.setCanvas(this.renderer.getRenderer().domElement);
    this.uiManager.setScene(this.sceneManager.getScene());

    this.uiManager.setOnConfigChange(this.handleConfigChange.bind(this));

    this.renderer.addUpdateCallback(this.update.bind(this));

    this.renderer.startAnimationLoop();

    console.log('Transparent Spring Clock initialized successfully');
  }

  private update(deltaTime: number): void {
    this.timeController.update();
    const timeState = this.timeController.getTimeState();

    this.watchAssembly.update(deltaTime, timeState);
    this.cameraController.update(deltaTime);

    this.uiManager.updateTime(this.timeController.getFormattedTime());
    this.uiManager.updateFps(this.renderer.getFps());
  }

  private handleConfigChange(config: Partial<AppConfig>): void {
    if (config.wireframe !== undefined) {
      this.watchAssembly.setWireframe(config.wireframe);
    }

    if (config.performanceMode !== undefined) {
      this.renderer.setPerformanceMode(config.performanceMode);
    }
  }

  dispose(): void {
    this.renderer.stopAnimationLoop();
    this.watchAssembly.dispose();
    this.cameraController.dispose();
    this.renderer.dispose();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new App();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});
