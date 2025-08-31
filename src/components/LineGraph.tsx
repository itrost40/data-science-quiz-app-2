import { useEffect, useRef } from 'react';
import { Line, Point } from '@/types/quiz';

interface LineGraphProps {
  line: Line;
  points?: Point[];
  width?: number;
  height?: number;
}

const LineGraph: React.FC<LineGraphProps> = ({ 
  line, 
  points = [], 
  width = 400, 
  height = 300 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up coordinate system (-10 to 10 on both axes)
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const xRange = 20; // -10 to 10
    const yRange = 20; // -10 to 10
    
    // Helper functions to convert between graph coordinates and canvas coordinates
    const toCanvasX = (x: number) => padding + ((x + 10) / xRange) * graphWidth;
    const toCanvasY = (y: number) => padding + ((10 - y) / yRange) * graphHeight;
    
    // Draw grid
    ctx.strokeStyle = 'hsl(220, 15%, 85%)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = -10; x <= 10; x += 2) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), padding);
      ctx.lineTo(toCanvasX(x), height - padding);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = -10; y <= 10; y += 2) {
      ctx.beginPath();
      ctx.moveTo(padding, toCanvasY(y));
      ctx.lineTo(width - padding, toCanvasY(y));
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'hsl(220, 25%, 25%)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, toCanvasY(0));
    ctx.lineTo(width - padding, toCanvasY(0));
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), padding);
    ctx.lineTo(toCanvasX(0), height - padding);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = 'hsl(220, 25%, 25%)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    
    // X-axis labels
    for (let x = -10; x <= 10; x += 5) {
      if (x !== 0) {
        ctx.fillText(x.toString(), toCanvasX(x), toCanvasY(0) + 20);
      }
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let y = -10; y <= 10; y += 5) {
      if (y !== 0) {
        ctx.fillText(y.toString(), toCanvasX(0) - 10, toCanvasY(y) + 4);
      }
    }
    
    // Draw the line y = mx + b
    ctx.strokeStyle = 'hsl(220, 80%, 45%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const x1 = -10;
    const y1 = line.slope * x1 + line.yIntercept;
    const x2 = 10;
    const y2 = line.slope * x2 + line.yIntercept;
    
    ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
    ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
    ctx.stroke();
    
    // Draw points if provided
    if (points.length > 0) {
      ctx.fillStyle = 'hsl(260, 60%, 50%)';
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(toCanvasX(point.x), toCanvasY(point.y), 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label the point
        ctx.fillStyle = 'hsl(220, 15%, 15%)';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(
          `(${point.x}, ${point.y})`, 
          toCanvasX(point.x) + 10, 
          toCanvasY(point.y) - 10
        );
        ctx.fillStyle = 'hsl(260, 60%, 50%)';
      });
    }
    
  }, [line, points, width, height]);
  
  return (
    <div className="flex justify-center">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="border border-border rounded-lg shadow-graph bg-surface"
      />
    </div>
  );
};

export default LineGraph;