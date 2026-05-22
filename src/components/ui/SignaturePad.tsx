import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import SignaturePadLib from 'signature_pad';
import { Eraser } from 'lucide-react';
import { Button } from './button';

export interface SignaturePadHandle {
  toDataURL: () => string | null;
  isEmpty: () => boolean;
  clear: () => void;
}

interface SignaturePadProps {
  onSign?: () => void;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ onSign }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const padRef = useRef<SignaturePadLib | null>(null);

    useEffect(() => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;

      const resize = () => {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d')?.scale(ratio, ratio);
        padRef.current?.clear();
      };

      padRef.current = new SignaturePadLib(canvas, {
        minWidth: 1.5,
        maxWidth: 3,
        penColor: '#1a1a1a',
      });

      padRef.current.addEventListener('endStroke', () => onSign?.());

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, []);

    useImperativeHandle(ref, () => ({
      toDataURL: () => (padRef.current?.isEmpty() ? null : padRef.current!.toDataURL('image/png')),
      isEmpty: () => padRef.current?.isEmpty() ?? true,
      clear: () => padRef.current?.clear(),
    }));

    return (
      <div className="space-y-2">
        <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full touch-none"
            style={{ height: 140, display: 'block' }}
          />
          <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-400 pointer-events-none select-none">
            Assine aqui com o dedo
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs h-8"
          type="button"
          onClick={() => padRef.current?.clear()}
        >
          <Eraser className="w-3 h-3" /> Limpar assinatura
        </Button>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';
