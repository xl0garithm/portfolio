import React, { useEffect, useRef } from 'react';

type MatrixRainProps = {
  className?: string;
};

export const MatrixRain: React.FC<MatrixRainProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];

    const characters = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = characters.split('');

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.floor(rect?.width ?? window.innerWidth);
      height = Math.floor(rect?.height ?? window.innerHeight);
      canvas.width = width;
      canvas.height = height;
      columns = Math.floor(width / 14);
      drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * height / 14));
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!ctx) return;
      // fade the whole canvas slightly to create trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i += 1) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * 14;
        const y = drops[i] * 14;

        // bright head
        ctx.fillStyle = '#aaffcc';
        ctx.fillText(text, x, y);

        // dim trail
        ctx.fillStyle = 'rgba(100, 255, 180, 0.6)';
        ctx.fillText(text, x, y - 14);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.textBaseline = 'top';
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};

export default MatrixRain;

