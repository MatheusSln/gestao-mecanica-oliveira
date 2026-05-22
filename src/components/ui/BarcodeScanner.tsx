import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from './button';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onCancel: () => void;
}

export function BarcodeScanner({ onScan, onCancel }: BarcodeScannerProps) {
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const [status, setStatus] = useState<'iniciando' | 'ativo' | 'erro'>('iniciando');
  const [erroMsg, setErroMsg] = useState('');
  const hasScanned = useRef(false);
  const stopped = useRef(false);

  useEffect(() => {
    let scanner: import('html5-qrcode').Html5Qrcode | null = null;

    import('html5-qrcode')
      .then(({ Html5Qrcode }) => {
        if (stopped.current) return;
        scanner = new Html5Qrcode('qr-scanner-container');
        scannerRef.current = scanner;
        return scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 180 } },
          (decodedText) => {
            if (hasScanned.current || stopped.current) return;
            hasScanned.current = true;
            scanner?.stop().catch(() => {}).finally(() => onScan(decodedText));
          },
          () => {}
        );
      })
      .then(() => { if (!stopped.current) setStatus('ativo'); })
      .catch((err: Error) => {
        if (stopped.current) return;
        const msg = err?.message ?? '';
        if (msg.includes('permission') || msg.includes('NotAllowed')) {
          setErroMsg('Permissão de câmera negada. Libere nas configurações do navegador.');
        } else if (msg.includes('NotFound') || msg.includes('no camera')) {
          setErroMsg('Nenhuma câmera encontrada neste dispositivo.');
        } else {
          setErroMsg('Não foi possível iniciar a câmera.');
        }
        setStatus('erro');
      });

    return () => {
      stopped.current = true;
      scanner?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <span className="font-bold text-sm">Escanear Código</span>
        </div>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {status === 'iniciando' && (
          <div className="flex flex-col items-center gap-3 text-white mb-6">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Iniciando câmera...</p>
          </div>
        )}
        {status === 'erro' && (
          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <p className="text-red-400 text-sm font-medium px-4">{erroMsg}</p>
            <Button variant="outline" onClick={onCancel} className="border-white text-white hover:bg-white/10">
              Fechar e digitar manualmente
            </Button>
          </div>
        )}
        <div id="qr-scanner-container" className="w-full max-w-sm rounded-xl overflow-hidden" />
        {status === 'ativo' && (
          <p className="text-white/70 text-xs text-center mt-4 px-8">
            Aponte a câmera para o código de barras ou QR code da embalagem
          </p>
        )}
      </div>

      <div className="p-4 pb-8">
        <Button
          variant="outline"
          className="w-full border-white/30 text-white hover:bg-white/10 h-12"
          onClick={onCancel}
        >
          Digitar código manualmente
        </Button>
      </div>
    </div>
  );
}
