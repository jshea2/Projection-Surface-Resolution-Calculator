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
`;

const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const SubTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 1rem;
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  font-size: 1rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  font-size: 1rem;
  padding: 0.5rem 1rem;
  background-color: #0077cc;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #005fa3;
  }
`;

const CanvasWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const SmallText = styled.p`
  font-size: 0.8rem;
  color: #666;
`;

const AspectRatioCalculator = () => {
  const [ratioWidth, setRatioWidth] = useState("16ft");
  const [ratioHeight, setRatioHeight] = useState("9ft");
  const [pixelWidth, setPixelWidth] = useState(1920);
  const [pixelHeight, setPixelHeight] = useState(1080);
  const [throwRatio, setThrowRatio] = useState(1.5);
  const [throwDistance, setThrowDistance] = useState(24); // Example initial value
  const [lockWidth, setLockWidth] = useState(false);
  const [lockHeight, setLockHeight] = useState(true);

  const gcd = (a, b) => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const handlePixelWidthChange = (e) => {
    if (!lockWidth) {
      setPixelWidth(e.target.value);
      const width = parseDimension(ratioWidth);
      const height = parseDimension(ratioHeight);
      if (width && height) {
        setPixelHeight(Math.round((e.target.value * height) / width));
      }
    }
  };

  const handlePixelHeightChange = (e) => {
    if (!lockHeight) {
      setPixelHeight(e.target.value);
      const width = parseDimension(ratioWidth);
      const height = parseDimension(ratioHeight);
      if (width && height) {
        setPixelWidth(Math.round((e.target.value * width) / height));
      }
    }
  };

  const handleRatioWidthChange = (e) => {
    setRatioWidth(e.target.value);
    const width = parseDimension(e.target.value);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      if (!lockWidth) {
        setPixelWidth(Math.round((pixelHeight * width) / height));
      }
      if (!lockHeight) {
        setPixelHeight(Math.round((pixelWidth * height) / width));
      }
      updateThrowDistance(width);
    }
  };

  const handleRatioHeightChange = (e) => {
    setRatioHeight(e.target.value);
    const width = parseDimension(ratioWidth);
    const height = parseDimension(e.target.value);
    if (width && height) {
      if (!lockWidth) {
        setPixelWidth(Math.round((pixelHeight * width) / height));
      }
      if (!lockHeight) {
        setPixelHeight(Math.round((pixelWidth * height) / width));
      }
      updateThrowDistance(width);
    }
  };

  const handleThrowRatioChange = (e) => {
    const newThrowRatio = e.target.value;
    setThrowRatio(newThrowRatio);
    const width = parseDimensionInFeet(ratioWidth);
    if (width) {
      const newThrowDistance = (width * newThrowRatio).toFixed(2);
      console.log(`Updating throw distance: ${newThrowDistance}`);
      setThrowDistance(newThrowDistance);
    }
  };

  const handleThrowDistanceChange = (e) => {
    const newThrowDistance = e.target.value;
    setThrowDistance(newThrowDistance);
    const width = parseDimensionInFeet(ratioWidth);
    if (width) {
      const newThrowRatio = (newThrowDistance / width).toFixed(2);
      console.log(`Updating throw ratio: ${newThrowRatio}`);
      setThrowRatio(newThrowRatio);
    }
  };

  const updateThrowDistance = (width) => {
    if (width) {
      const widthInFeet = width / 12;
      const newThrowDistance = (widthInFeet * throwRatio).toFixed(2);
      console.log(`Updating throw distance in updateThrowDistance: ${newThrowDistance}`);
      setThrowDistance(newThrowDistance);
    }
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
          return mainValue * 12;
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

  const parseDimensionInFeet = (value) => {
    const inches = parseDimension(value);
    return inches / 12; // Convert inches to feet
  };

  const displayRatio = () => {
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      const divisor = gcd(width, height);
      return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
    }
    return 'Invalid dimensions';
  };

  const calculatePixelPitch = () => {
    const width = parseDimension(ratioWidth) / 0.0393701; // Convert inches to mm
    return (width / pixelWidth).toFixed(2);
  };

  const calculateViewingDistance = () => {
    const pixelPitch = calculatePixelPitch(); // in mm
    const pixelPitchMeters = pixelPitch; // Convert mm to meters
    return (pixelPitchMeters * 3.28084).toFixed(2); // Convert meters to feet
  };

  const canvasRef = useRef(null);
  const previewSize = 200;

  useEffect(() => {
    drawPreview();
    drawVisualization();
  }, [pixelWidth, pixelHeight, throwRatio, throwDistance, ratioWidth, ratioHeight]);

  const drawText = (ctx, text, x, y) => {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };

  const drawPreview = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the preview dimensions
    const aspectRatio = pixelWidth / pixelHeight;
    let previewWidth = previewSize;
    let previewHeight = previewSize / aspectRatio;

    if (previewHeight > previewSize) {
      previewHeight = previewSize;
      previewWidth = previewSize * aspectRatio;
    }

    // Draw the preview rectangle
    ctx.fillStyle = 'gray';
    ctx.fillRect((canvas.width - previewWidth) / 2, (canvas.height - previewHeight) / 2, previewWidth, previewHeight);

    // Display the resolution
    drawText(ctx, `${pixelWidth}x${pixelHeight}`, canvas.width / 2, canvas.height / 2);
  };

  const visualizationCanvasRef = useRef(null);
  const visualizationSize = 600;

  const drawVisualization = () => {
    const canvas = visualizationCanvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

   // Convert surface dimension width to feet
const screenWidthFeet = parseDimensionInFeet(ratioWidth);

// Draw the screen
const screenHeight = 50; // fixed height for visualization
const screenWidth = screenWidthFeet * 10; // scale the width appropriately
const screenY = canvas.height / 1.2 + screenHeight; // Adjust the screen position
ctx.fillStyle = 'blue';
ctx.fillRect((canvas.width - screenWidth) / 2, screenY, screenWidth, 3);

// Draw the throw distance line
const distance = parseFloat(throwDistance) * 10; // Adjust the scaling factor if needed
ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
ctx.beginPath();
ctx.moveTo(canvas.width / 2, screenY); // Start from the top of the screen
ctx.lineTo(canvas.width / 2, screenY - distance); // Adjust the throw distance
ctx.stroke();

    // Draw the cone lines
    ctx.setLineDash([]);
ctx.beginPath();
ctx.moveTo(canvas.width / 2, screenY - distance); // Source point at the top of the throw distance line
ctx.lineTo((canvas.width - screenWidth) / 2, screenY); // Left edge of the screen
ctx.stroke();

ctx.beginPath();
ctx.moveTo(canvas.width / 2, screenY - distance); // Source point at the top of the throw distance line
ctx.lineTo((canvas.width + screenWidth) / 2, screenY); // Right edge of the screen
ctx.stroke();





    // Draw the throw ratio label
    drawText(ctx, `Throw Ratio: ${throwRatio}`, canvas.width / 2, canvas.height / 2 + screenHeight / 2 + 0);

    // Draw the throw distance label
    drawText(ctx, `Throw Distance: ${throwDistance} ft`, canvas.width / 2, canvas.height / 2 + screenHeight / 2 + 100);

    // Draw the screen width label
    drawText(ctx, `Surface Width: ${ratioWidth}`, canvas.width / 2, canvas.height / 2 + screenHeight / 2 + 200);
  };

  const generateTestPattern = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    const ctx = canvas.getContext('2d');

    // Draw the test pattern (grid)
    const gridSize = 20;
    const gridRows = Math.ceil(pixelHeight / gridSize);
    const gridCols = Math.ceil(pixelWidth / gridSize);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    for (let row = 1; row < gridRows; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * gridSize);
      ctx.lineTo(pixelWidth, row * gridSize);
      ctx.stroke();
    }

    for (let col = 1; col < gridCols; col++) {
      ctx.beginPath();
      ctx.moveTo(col * gridSize, 0);
      ctx.lineTo(col * gridSize, pixelHeight);
      ctx.stroke();
    }

    // Display the resolution
    drawText(ctx, `${pixelWidth}x${pixelHeight}`, pixelWidth / 2, pixelHeight / 2);

    // Download the test pattern as an image
    const link = document.createElement('a');
    link.download = `test_pattern_${pixelWidth}x${pixelHeight}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Container>
      <Title>Projection Surface Resolution Calculator</Title>
      <SubTitle>Surface Dimension</SubTitle>
      <SmallText>Units: ft, in, mm</SmallText>
      <Label>
        Width:
        <Input type="text" value={ratioWidth} onChange={handleRatioWidthChange} />
      </Label>
      <br />
      <Label>
        Height:
        <Input type="text" value={ratioHeight} onChange={handleRatioHeightChange} />
      </Label>
      <SubTitle>Surface Resolution</SubTitle>
      <Label>
        Pixel Width:
        <Input type="number" value={pixelWidth} onChange={handlePixelWidthChange} />
        <br />
        <Input
          type="checkbox"
          checked={lockWidth}
          onChange={(e) => setLockWidth(e.target.checked)}
        />
        Lock
      </Label>
      <br />
      <Label>
        Pixel Height:
        <Input type="number" value={pixelHeight} onChange={handlePixelHeightChange} />
        <br />
        <Input
          type="checkbox"
          checked={lockHeight}
          onChange={(e) => setLockHeight(e.target.checked)}
        />
        Lock
      </Label>
      <br />
      <SubTitle>Throw Ratio and Distance</SubTitle>
      <Label>
        Throw Ratio:
        <Input type="number" value={throwRatio} onChange={handleThrowRatioChange} step="0.01"/>
      </Label>
      <br />
      <Label>
        Throw Distance (ft):
        <Input type="number" value={throwDistance} onChange={handleThrowDistanceChange} step="0.01"/>
      </Label>
      <br />
      <SubTitle>Aspect Ratio: {displayRatio()}</SubTitle>
      <SubTitle>Pixel Pitch: {calculatePixelPitch()} mm</SubTitle>
      <SmallText>Minimum Viewing Distance: {calculateViewingDistance()} ft</SmallText>
      <CanvasWrapper>
        <canvas ref={canvasRef} width={previewSize} height={previewSize}></canvas>
      </CanvasWrapper>
      <Button onClick={generateTestPattern}>Download Test Pattern</Button>
      <br />
      <br />
      <a href="https://vioso.com/testpattern-generator/" target="_blank" rel="noopener noreferrer">
        <SubTitle>Generate Test Pattern</SubTitle>
      </a>
            <CanvasWrapper>
        <canvas ref={visualizationCanvasRef} width={visualizationSize} height={visualizationSize}></canvas>
      </CanvasWrapper>
      <br />
      <br />
      <br />
      <small>Made by Joe Shea & ChatGPT</small>
    </Container>
  );
};

export default AspectRatioCalculator;
