import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  background-color: #f7f7f7;
  border-radius: 5px;
  text-align: left;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  margin-bottom: 1rem;
`;

const Canvas = styled.canvas`
  border: 1px solid #000;
`;

const AspectRatioDrawer = ({ ratioWidth, ratioHeight, setRatioWidth, setRatioHeight, pixelWidth, pixelHeight, setPixelWidth, setPixelHeight }) => {
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(null);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const desiredWidth = 800; // Desired width for the scaled image
  const desiredHeight = 600; // Desired height for the scaled image

  useEffect(() => {
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext('2d');
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;

        // Calculate the aspect ratio of the image
        const aspectRatio = img.width / img.height;

        let width = desiredWidth;
        let height = desiredHeight;

        // Adjust the dimensions to maintain the aspect ratio
        if (aspectRatio > 1) {
          height = desiredWidth / aspectRatio;
        } else {
          width = desiredHeight * aspectRatio;
        }

        // Resize the canvas to the scaled image dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw the scaled image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
        setImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setStartX(e.clientX - rect.left);
    setStartY(e.clientY - rect.top);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setEndX(x);
    setEndY(y);

    const width = Math.abs(x - startX);
    const height = Math.abs(y - startY);
    const ratio = (width / height).toFixed(2);
    setAspectRatio(ratio);
  };

  const updateWidth = () => {
    const newHeight = parseDimension(ratioHeight);
    const newWidth = (newHeight * aspectRatio).toFixed(2);
    setRatioWidth(`${newWidth}ft`);
    setPixelWidth(Math.round((pixelHeight * aspectRatio)));
  };

  const updateHeight = () => {
    const newWidth = parseDimension(ratioWidth);
    const newHeight = (newWidth / aspectRatio).toFixed(2);
    setRatioHeight(`${newHeight}ft`);
    setPixelHeight(Math.round((pixelWidth / aspectRatio)));
  };

  const parseDimension = (value) => {
    const regex = /^(\d+(?:\.\d+)?)(?:'(\d{1,2})"|ft-?(\d{1,2})in|ft|mm|"|in)?'?$/;
    const match = value.match(regex);
    if (match) {
      const mainValue = parseFloat(match[1]);
      const unit = match[2] ? "ftin" : (match[3] ? "ft-in" : (match[0].includes("mm") ? "mm" : (match[0].includes("in") || match[0].includes('"') ? "in" : "ft")));

      let inches = 0;
      if (unit === "ftin") {
        inches = parseInt(match[2], 10);
      } else if (unit === "ft-in") {
        inches = parseInt(match[3], 10);
      }

      switch (unit) {
        case "ftin":
        case "ft-in":
          return mainValue * 12 + inches;
        case "ft":
          return mainValue;
        case "mm":
          return mainValue * 0.0393701; // Convert millimeters to inches
        case "in":
          return mainValue;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <Container>
      <Title>Estimate Aspect Ratio from Img</Title>
      <div>
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      <small>Upload file, click and drag box over image</small>
      <div>
        <Canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
      {aspectRatio && (
        <div>
          <h2>Estimated Aspect Ratio: {aspectRatio}:1</h2>
          <div>
            <button onClick={updateWidth}> Surface W = {aspectRatio} * H</button>
            <button onClick={updateHeight}>Surface H = {aspectRatio} / W</button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AspectRatioDrawer;
