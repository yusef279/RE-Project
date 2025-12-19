/**
 * PixiJS utility functions for game rendering
 * This file provides helper functions to initialize and manage PixiJS applications
 */

import * as PIXI from 'pixi.js';

/**
 * Initialize a PixiJS application with default settings
 * @param container - HTML element or container ID to mount the application
 * @param options - Optional configuration for the PixiJS application
 * @returns Initialized PIXI.Application instance
 */
export function initPixiApp(
  container: HTMLElement | string,
  options?: Partial<PIXI.IApplicationOptions>
): PIXI.Application {
  const defaultOptions: PIXI.IApplicationOptions = {
    width: 800,
    height: 600,
    backgroundColor: 0xffffff,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    ...options,
  };

  const app = new PIXI.Application(defaultOptions);

  // Mount to container
  if (typeof container === 'string') {
    const element = document.getElementById(container);
    if (element) {
      element.appendChild(app.view as HTMLCanvasElement);
    } else {
      throw new Error(`Container element with id "${container}" not found`);
    }
  } else {
    container.appendChild(app.view as HTMLCanvasElement);
  }

  // Handle window resize
  const handleResize = () => {
    if (typeof container === 'string') {
      const element = document.getElementById(container);
      if (element) {
        app.renderer.resize(element.clientWidth, element.clientHeight);
      }
    } else {
      app.renderer.resize(container.clientWidth, container.clientHeight);
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  return app;
}

/**
 * Create a sprite from an image URL
 * @param url - Image URL
 * @returns Promise resolving to PIXI.Sprite
 */
export async function createSpriteFromUrl(url: string): Promise<PIXI.Sprite> {
  const texture = await PIXI.Assets.load(url);
  return new PIXI.Sprite(texture);
}

/**
 * Create a text sprite with styling
 * @param text - Text content
 * @param style - PIXI.TextStyle options
 * @returns PIXI.Text instance
 */
export function createText(
  text: string,
  style?: Partial<PIXI.ITextStyle>
): PIXI.Text {
  const defaultStyle: Partial<PIXI.ITextStyle> = {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0x000000,
    align: 'center',
    ...style,
  };

  return new PIXI.Text({
    text,
    style: defaultStyle,
  });
}

/**
 * Clean up PixiJS application
 * @param app - PIXI.Application instance to destroy
 */
export function destroyPixiApp(app: PIXI.Application): void {
  app.destroy(true, {
    children: true,
    texture: true,
    baseTexture: true,
  });
}
