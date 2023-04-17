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

const AspectRatioCalculator = () => {
  const [ratioWidth, setRatioWidth] = useState("16'0\"");
  const [ratioHeight, setRatioHeight] = useState("9'0\"");
  const [pixelWidth, setPixelWidth] = useState(1920);
  const [pixelHeight, setPixelHeight] = useState(1080);
  const [lockWidth, setLockWidth] = useState(false);
  const [lockHeight, setLockHeight] = useState(true);


  const gcd = (a, b) => {
    if (b === 0) return a;
    return gcd(b, a % b);
  };

// Update handlePixelWidthChange and handlePixelHeightChange functions
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

// Update handleRatioWidthChange and handleRatioHeightChange functions
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



  const displayRatio = () => {
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      const divisor = gcd(width, height);
      return `${width / divisor}:${height / divisor}`;
    }
    return 'Invalid dimensions';
  };

    const canvasRef = useRef(null);
  const previewSize = 200;

  useEffect(() => {
    drawPreview();
  }, [pixelWidth, pixelHeight]);

   const drawText = (ctx, text, x, y) => {
    ctx.fillStyle = 'black';
    ctx.font = '32px Arial';
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
          <Input
          type="checkbox"
          checked={lockWidth}
          onChange={(e) => setLockWidth(e.target.checked)}
        
        />
        Lock
      </Label>
      <Label>
  

</Label>
<br />
    <br />
    <Label>
      Pixel Height:
        <Input type="number" value={pixelHeight} onChange={handlePixelHeightChange} />
          <Input
          type="checkbox"
          checked={lockHeight}
          onChange={(e) => setLockHeight(e.target.checked)}
        />
        Lock
      </Label>
      <Label>
</Label>
    <br />
    <br />
    <SubTitle>Aspect Ratio: {displayRatio()}</SubTitle>
    <CanvasWrapper>
    <canvas ref={canvasRef} width={previewSize} height={previewSize}></canvas>
      </CanvasWrapper>
      <Button onClick={generateTestPattern}>Download Test Pattern</Button>
      <br />
      <br />

    <a href="https://vioso.com/testpattern-generator/" target="_blank" rel="noopener noreferrer">
  <SubTitle>Generate Test Pattern</SubTitle>
</a>
      <br />
      <br />
      <br />
      <small>Made by ChatGPT & Joe Shea</small>
    </Container>
);
};


export default AspectRatioCalculator;
