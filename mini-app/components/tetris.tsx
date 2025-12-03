"use client";

import { useEffect, useRef, useState } from "react";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

const SHAPES = [
  [[1,1,1,1]], // I
  [[1,1,1],[0,1,0]], // T
  [[1,1,0],[0,1,1]], // S
  [[0,1,1],[1,1,0]], // Z
  [[1,1],[1,1]], // O
  [[1,0,0],[1,1,1]], // J
  [[0,0,1],[1,1,1]] // L
];

function rotate(shape: number[][]): number[][] {
  const n = shape.length;
  const m = shape[0].length;
  const res = Array.from({length: m}, () => Array(n).fill(0));
  for (let i=0;i<n;i++){
    for (let j=0;j<m;j++){
      res[j][n-1-i] = shape[i][j];
    }
  }
  return res;
}

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[][]>(Array.from({length: ROWS}, () => Array(COLS).fill(0)));
  const [current, setCurrent] = useState<{shape: number[][], x: number, y: number}>({
    shape: SHAPES[0],
    x: Math.floor(COLS/2)-1,
    y: 0
  });

  const draw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0,0, COLS*BLOCK_SIZE, ROWS*BLOCK_SIZE);
    // draw grid
    for (let r=0;r<ROWS;r++){
      for (let c=0;c<COLS;c++){
        if (grid[r][c]){
          ctx.fillStyle = "#4f46e5";
          ctx.fillRect(c*BLOCK_SIZE, r*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#fff";
          ctx.strokeRect(c*BLOCK_SIZE, r*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
    // draw current piece
    const {shape, x, y} = current;
    shape.forEach((row, i)=>{
      row.forEach((cell, j)=>{
        if (cell){
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect((x+j)*BLOCK_SIZE, (y+i)*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#fff";
          ctx.strokeRect((x+j)*BLOCK_SIZE, (y+i)*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  };

  const collision = (shape: number[][], offsetX: number, offsetY: number): boolean => {
    for (let r=0;r<shape.length;r++){
      for (let c=0;c<shape[r].length;c++){
        if (shape[r][c]){
          const newX = offsetX + c;
          const newY = offsetY + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && grid[newY][newX]) return true;
        }
      }
    }
    return false;
  };

  const merge = () => {
    const {shape, x, y} = current;
    const newGrid = grid.map(row => [...row]);
    shape.forEach((row, i)=>{
      row.forEach((cell, j)=>{
        if (cell){
          const gx = x + j;
          const gy = y + i;
          if (gy >= 0 && gy < ROWS && gx >=0 && gx < COLS){
            newGrid[gy][gx] = 1;
          }
        }
      });
    });
    setGrid(newGrid);
  };

  const clearLines = () => {
    const newGrid = grid.filter(row => row.some(cell => cell===0));
    const linesCleared = ROWS - newGrid.length;
    const emptyRows = Array.from({length: linesCleared}, () => Array(COLS).fill(0));
    setGrid([...emptyRows, ...newGrid]);
  };

  const drop = () => {
    if (!collision(current.shape, current.x, current.y + 1)){
      setCurrent(prev => ({...prev, y: prev.y + 1}));
    } else {
      merge();
      clearLines();
      const newShape = SHAPES[Math.floor(Math.random()*SHAPES.length)];
      const newX = Math.floor(COLS/2) - Math.floor(newShape[0].length/2);
      const newPiece = {shape: newShape, x: newX, y: 0};
      if (collision(newPiece.shape, newPiece.x, newPiece.y)){
        // Game over: reset
        setGrid(Array.from({length: ROWS}, () => Array(COLS).fill(0)));
      } else {
        setCurrent(newPiece);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(drop, 500);
    return () => clearInterval(interval);
  }, [current, grid]);

  useEffect(() => {
    draw();
  }, [grid, current]);

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft"){
      if (!collision(current.shape, current.x -1, current.y)){
        setCurrent(prev => ({...prev, x: prev.x -1}));
      }
    } else if (e.key === "ArrowRight"){
      if (!collision(current.shape, current.x +1, current.y)){
        setCurrent(prev => ({...prev, x: prev.x +1}));
      }
    } else if (e.key === "ArrowDown"){
      drop();
    } else if (e.key === "ArrowUp"){
      const rotated = rotate(current.shape);
      if (!collision(rotated, current.x, current.y)){
        setCurrent(prev => ({...prev, shape: rotated}));
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, grid]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} width={COLS*BLOCK_SIZE} height={ROWS*BLOCK_SIZE} className="border border-gray-300" />
      <p className="text-sm">Use arrow keys to move, rotate, and drop.</p>
    </div>
  );
}
