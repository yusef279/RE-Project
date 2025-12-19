'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { initPixiApp, destroyPixiApp } from '@/utils/pixi-setup';
import * as PIXI from 'pixi.js';

interface PixiGameContainerProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
  onAppReady?: (app: PIXI.Application) => void;
  children?: ReactNode;
  className?: string;
}

/**
 * PixiJS Game Container Component
 * Provides a React wrapper for PixiJS applications
 * Use this component when creating games with PixiJS
 */
export default function PixiGameContainer({
  width = 800,
  height = 600,
  backgroundColor = 0xffffff,
  onAppReady,
  children,
  className = '',
}: PixiGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize PixiJS app
    const app = initPixiApp(containerRef.current, {
      width,
      height,
      backgroundColor,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    appRef.current = app;

    // Notify parent component that app is ready
    if (onAppReady) {
      onAppReady(app);
    }

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        destroyPixiApp(appRef.current);
        appRef.current = null;
      }
    };
  }, [width, height, backgroundColor, onAppReady]);

  return (
    <div
      ref={containerRef}
      className={`pixi-game-container ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}
