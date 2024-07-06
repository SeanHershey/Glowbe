import { useRef } from 'react';
import "./Draw.css";
import React from 'react';

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { useState, useEffect } = React
    const [ticking] = useState(true)
    const [count, setCount] = useState(0)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    
    useEffect(() => {
        const update = (e : MouseEvent) => {
            console.log((e.target as HTMLCanvasElement).id)
            if (e.target != null &&
                (e.target as HTMLCanvasElement).id != null &&
                (e.target as HTMLCanvasElement).id == 'area') {
                setX(e.offsetX)
                setY(e.offsetY)
            }
        }
        window.addEventListener('mousemove', update);

        const timer = setTimeout(() => ticking && setCount(count+1), 50)

        const canvas = canvasRef.current;
        if (canvas == null) return; 

        canvas.width = Math.min(window.innerHeight, window.innerWidth);
        canvas.height = Math.min(window.innerHeight, window.innerWidth);
        
        const gl = canvas.getContext("webgl");
        if (gl == null) return;

        // vertex points
        var vertices = [];

        const goldenRatio = 1 + Math.sqrt(5)/4;
        const angle = Math.PI * 2 * goldenRatio;
        const scale = (Math.max(
                            Math.abs(x - canvas.width/2),
                            Math.abs(y - canvas.width/2)) 
                       / canvas.width) * 2;
        const number = 10000 * scale;

        for (let i = 0; i < number; i++) {
            const dist = i / number
            const incline = Math.acos(1 - 2 * dist)
            const azimuth = angle * i

            vertices.push(Math.sin(incline) * Math.cos(azimuth) * scale);
            vertices.push(Math.sin(incline) * Math.sin(azimuth) * scale);
            vertices.push(Math.cos(incline) * scale);
        }
        
        var vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // vert shader
        var vertCode = `
        attribute vec3 coordinates;
        void main(void) {
            gl_Position = vec4(coordinates, 1.0);
            gl_PointSize = `+ scale * 3 +`;
        }`;
        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        if (vertShader == null) return;
        gl.shaderSource(vertShader, vertCode);
        gl.compileShader(vertShader);

        // fragment shader
        var fragCode = `
        void main(void) {
            gl_FragColor = vec4(0.055, 0.616, 0.333, 0.1);
        }`;
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (fragShader == null) return;
        gl.shaderSource(fragShader, fragCode);
        gl.compileShader(fragShader);

        // attach shaders
        var shaderProgram = gl.createProgram();
        if (shaderProgram == null) return;
        gl.attachShader(shaderProgram, vertShader); 
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // add points
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        var coord = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);

        // clear canvas
        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0,0,canvas.width,canvas.height);

        // draw points
        gl.drawArrays(gl.POINTS, 0, number);

        return () => clearTimeout(timer)

    }, [count, ticking, setX, setY]);

    return <canvas id="area" ref={canvasRef} />;
};

export default function Draw() {
    return (
        <Canvas />
    );
}