import { useEffect, useRef } from 'react';
import "./App.css";


const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas == null) return; 
        
        const context = canvas.getContext("webgl");
        if (context == null) return;
        
        context.clearColor(1,0,1,0.5)
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)

    }, []);

    return <canvas ref={canvasRef} />;
};

export default function App() {
    return (
        <Canvas />
    );
}