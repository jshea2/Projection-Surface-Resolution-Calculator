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
  padding: 0.2rem;
  margin-bottom: 0.5rem;
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

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const FootLambertsDisplay = styled.div`
  font-size: 1.5rem;
  color: ${({ value }) => {
    if (value <= 15.99) return 'red';
    if (value >= 16 && value <= 50) return 'green';
    if (value >= 51 && value <= 1000) return 'yellow';
    return 'black';
  }};
`;

const AspectRatioCalculator = () => {
  const [ratioWidth, setRatioWidth] = useState("16ft");
  const [ratioHeight, setRatioHeight] = useState("9ft");
  const [pixelWidth, setPixelWidth] = useState(1920);
  const [pixelHeight, setPixelHeight] = useState(1080);
  const [throwRatio, setThrowRatio] = useState(1.5);
  const [throwDistance, setThrowDistance] = useState(24); // Example initial value
  const [lumens, setLumens] = useState(0);
  const [footLamberts, setFootLamberts] = useState(0);
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
      updateFootLamberts(lumens, width, height);
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
      updateFootLamberts(lumens, width, height);
    }
  };

  const handleThrowRatioChange = (e) => {
    const newThrowRatio = e.target.value;
    setThrowRatio(newThrowRatio);
    const width = parseDimensionInFeet(ratioWidth);
    if (width) {
      const newThrowDistance = (width * newThrowRatio).toFixed(2);
      setThrowDistance(newThrowDistance);
    }
  };

  const handleThrowDistanceChange = (e) => {
    const newThrowDistance = e.target.value;
    setThrowDistance(newThrowDistance);
    const width = parseDimensionInFeet(ratioWidth);
    if (width) {
      const newThrowRatio = (newThrowDistance / width).toFixed(2);
      setThrowRatio(newThrowRatio);
    }
  };

  const handleLumensChange = (e) => {
    const newLumens = e.target.value;
    setLumens(newLumens);
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      updateFootLamberts(newLumens, width, height);
    }
  };

  const setLumensForFootLamberts = () => {
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      const widthInFeet = width / 12;
      const heightInFeet = height / 12;
      const surfaceArea = widthInFeet * heightInFeet;
      const lumensFor16fL = (16 * surfaceArea).toFixed(2);
      setLumens(lumensFor16fL);
      updateFootLamberts(lumensFor16fL, width, height);
    }
  };

    const setLumensForFootLamberts32 = () => {
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      const widthInFeet = width / 12;
      const heightInFeet = height / 12;
      const surfaceArea = widthInFeet * heightInFeet;
      const lumensFor16fL = (32 * surfaceArea).toFixed(2);
      setLumens(lumensFor16fL);
      updateFootLamberts(lumensFor16fL, width, height);
    }
    };
  
    const setLumensForFootLamberts48 = () => {
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      const widthInFeet = width / 12;
      const heightInFeet = height / 12;
      const surfaceArea = widthInFeet * heightInFeet;
      const lumensFor16fL = (48 * surfaceArea).toFixed(2);
      setLumens(lumensFor16fL);
      updateFootLamberts(lumensFor16fL, width, height);
    }
  };

  const updateThrowDistance = (width) => {
    if (width) {
      const widthInFeet = width / 12;
      const newThrowDistance = (widthInFeet * throwRatio).toFixed(2);
      setThrowDistance(newThrowDistance);
    }
  };

  const updateFootLamberts = (lumens, width, height) => {
    const widthInFeet = width / 12;
    const heightInFeet = height / 12;
    const surfaceArea = widthInFeet * heightInFeet;
    const newFootLamberts = (lumens / surfaceArea).toFixed(2);
    setFootLamberts(newFootLamberts);
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

  const calculateHeightForAspectRatio = () => {
    const width = parseDimension(ratioWidth);
    if (width) {
      const height = (width * 9) / 16;
      const heightInFeet = `${(height / 12).toFixed(2)}ft`;
      setRatioHeight(heightInFeet);
      setPixelWidth(1920);
      setPixelHeight(1080);
      updateFootLamberts(lumens, width, height);
    }
  };

  const calculateWidthForAspectRatio = () => {
    const height = parseDimension(ratioHeight);
    if (height) {
      const width = (height * 16) / 9;
      const widthInFeet = `${(width / 12).toFixed(2)}ft`;
      setRatioWidth(widthInFeet);
      setPixelHeight(1080);
      setPixelWidth(1920);
      updateFootLamberts(lumens, width, height);
    }
  };

  const canvasRef = useRef(null);
  const previewSize = 200;

  useEffect(() => {
    drawPreview();
    drawVisualization();
  }, [pixelWidth, pixelHeight, throwRatio, throwDistance, ratioWidth, ratioHeight, lumens]);

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
    const distance = parseFloat(throwDistance) * 10; // Adjust the scaling factor if needed
    const screenHeight = 50; // fixed height for visualization
    const screenWidth = screenWidthFeet * 10; // scale the width appropriately
    const screenY = canvas.height / 1.2 + screenHeight; // Adjust the screen position
    ctx.fillStyle = 'blue';
    ctx.fillRect((canvas.width - screenWidth) / 2, screenY, screenWidth, 3);
    ctx.fillRect((canvas.width / 2) - 10, (screenY - distance) - 30, 20, 30);

    // Draw the throw distance line
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
    drawText(ctx, `Throw Ratio: ${throwRatio}`, canvas.width / 2, (screenY - distance) + 20);

    // Draw the throw distance label
    drawText(ctx, `Throw Distance: ${throwDistance} ft`, canvas.width / 2, (screenY - (distance / 2)) + 40);

    // Draw the screen width label
    drawText(ctx, `Surface Width: ${ratioWidth}`, canvas.width / 2, screenY + 20);
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
      
      <Section>
        <SubTitle>Surface Dimension</SubTitle>
        <SmallText>Units: ft, in, mm</SmallText>
        <InputGroup>
          <Label>Width:</Label>
          <Input type="text" value={ratioWidth} onChange={handleRatioWidthChange} />
          <Button onClick={calculateHeightForAspectRatio}>16:9</Button>
        </InputGroup>
        <InputGroup>
          <Label>Height:</Label>
          <Input type="text" value={ratioHeight} onChange={handleRatioHeightChange} />
          <Button onClick={calculateWidthForAspectRatio}>16:9</Button>
        </InputGroup>
      </Section>
      
      <Section>
        <SubTitle>Projector/Surface Resolution</SubTitle>
        <InputGroup>
          <Label>Pixel Width:</Label>
          <Input type="number" value={pixelWidth} onChange={handlePixelWidthChange} />
          <Input type="checkbox" checked={lockWidth} onChange={(e) => setLockWidth(e.target.checked)} />
          <Label>Lock</Label>
        </InputGroup>
        <InputGroup>
          <Label>Pixel Height:</Label>
          <Input type="number" value={pixelHeight} onChange={handlePixelHeightChange} />
          <Input type="checkbox" checked={lockHeight} onChange={(e) => setLockHeight(e.target.checked)} />
          <Label>Lock</Label>
        </InputGroup>
        <SubTitle>Aspect Ratio: {displayRatio()}</SubTitle>
        <SubTitle>Pixel Pitch: {calculatePixelPitch()} mm</SubTitle>
        <SmallText>Closest Optimal Viewing Distance: {calculateViewingDistance()} ft</SmallText>
        <CanvasWrapper>
          <canvas ref={canvasRef} width={previewSize} height={previewSize}></canvas>
        </CanvasWrapper>
        <Button onClick={generateTestPattern}>Download Test Pattern</Button>
        <a href="https://vioso.com/testpattern-generator/" target="_blank" rel="noopener noreferrer">
          <SubTitle>Generate Test Pattern</SubTitle>
        </a>
      </Section>

      <Section>
        <SubTitle>Throw Ratio and Distance</SubTitle>
        <InputGroup>
          <Label>Throw Ratio:</Label>
          <Input type="number" value={throwRatio} onChange={handleThrowRatioChange} step="0.01" />
        </InputGroup>
        <InputGroup>
          <Label>Throw Distance (ft):</Label>
          <Input type="number" value={throwDistance} onChange={handleThrowDistanceChange} step="0.01" />
        </InputGroup>
        <InputGroup>
          <Label>Lumens:</Label>
          <Input type="number" value={lumens} onChange={handleLumensChange} step="1" />
          <Button onClick={setLumensForFootLamberts}>16fL</Button>
          <Button onClick={setLumensForFootLamberts32}>32fL</Button>
          <Button onClick={setLumensForFootLamberts48}>48fL</Button>
        </InputGroup>
        <SubTitle>
          Foot Lamberts: <FootLambertsDisplay value={footLamberts}>{footLamberts} fL</FootLambertsDisplay>
        </SubTitle>
      </Section>
      
      <CanvasWrapper>
        <canvas ref={visualizationCanvasRef} width={visualizationSize} height={visualizationSize}></canvas>
      </CanvasWrapper>
      
      <small>Made by Joe Shea & ChatGPT</small>
    </Container>
  );
};

export default AspectRatioCalculator;
