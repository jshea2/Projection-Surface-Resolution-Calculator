import React, { useState, useEffect, useRef } from 'react';
import AspectRatioDrawer from './AspectRatioDrawer';
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
  font-size: 1.2rem;
  padding: 0.4rem;
  margin-bottom: 0.1rem;
  width: 80px; /* Adjust this value as needed */
`;
const Inputcheck = styled.input`
  font-size: 1.2rem;
  padding: 0.4rem;
  margin-bottom: 0.1rem;
`;

const Input2 = styled.input`
  font-size: 1.2rem;
  padding: 0.4rem;
  margin-bottom: 0.1rem;

  width: 200px; /* Adjust this value as needed */

`;

const Button = styled.button`
  font-size: 1rem;
  padding: 0.5rem 1rem;
  background-color: #0077cc;
  color: white;
  border: none;
  border-radius: 0.2px;
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
  if (value == 0) return 'black'; 
  if (value < 15) return 'red';
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
  const [screenGain, setScreenGain] = useState(1.0); // New state for screen gain
  const [lockWidth, setLockWidth] = useState(false);
  const [lockHeight, setLockHeight] = useState(true);
  const [testPatternName, setTestPatternName] = useState('Test Pattern Name');

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
      updateFootLamberts(lumens, width, height, screenGain);
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
      updateFootLamberts(lumens, width, height, screenGain);
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
      updateFootLamberts(newLumens, width, height, screenGain);
    }
  };

  const handleScreenGainChange = (e) => {
    const newScreenGain = e.target.value;
    setScreenGain(newScreenGain);
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      updateFootLamberts(lumens, width, height, newScreenGain);
    }
  };

  const setLumensForFootLamberts = (desiredFL) => {
    const width = parseDimension(ratioWidth);
    const height = parseDimension(ratioHeight);
    if (width && height) {
      const widthInFeet = width / 12;
      const heightInFeet = height / 12;
      const surfaceArea = widthInFeet * heightInFeet;
      const lumensForFL = (desiredFL * surfaceArea).toFixed(2);
      setLumens(lumensForFL);
      updateFootLamberts(lumensForFL, width, height, screenGain);
    }
  };

  const updateThrowDistance = (width) => {
    if (width) {
      const widthInFeet = width / 12;
      const newThrowDistance = (widthInFeet * throwRatio).toFixed(2);
      setThrowDistance(newThrowDistance);
    }
  };

  const updateFootLamberts = (lumens, width, height, screenGain) => {
    const widthInFeet = width / 12;
    const heightInFeet = height / 12;
    const surfaceArea = widthInFeet * heightInFeet;
    const newFootLamberts = ((lumens * screenGain) / surfaceArea).toFixed(2);
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
      // Check for standard aspect ratios
      const standardRatios = {
        '16:9': 16 / 9,
        '16:10': 16 / 10,
        '4:3': 4 / 3,
        '2:1': 2 / 1,
        '1:1': 1 / 1
      };
      const decimalRatio = (width / height).toFixed(2);
      for (const [key, value] of Object.entries(standardRatios)) {
        if (Math.abs(value - width / height) < 0.01) {
          return `${key} (${decimalRatio}:1)`;
        }
      }

      // If it's not a standard ratio, use gcd to calculate the ratio
      const divisor = gcd(width, height);
      const wholeNumberRatioWidth = Math.round(width / divisor);
      const wholeNumberRatioHeight = Math.round(height / divisor);

      // Check if either value in the first aspect ratio exceeds 300
      if (wholeNumberRatioWidth > 300 || wholeNumberRatioHeight > 300) {
        return `(${decimalRatio}:1)`;
      } else {
        const wholeNumberRatio = `${wholeNumberRatioWidth}:${wholeNumberRatioHeight}`;
        return `${wholeNumberRatio} (${decimalRatio}:1)`;
      }
    }
    return 'Invalid dimensions';
  };

  const calculatePixelPitch = () => {
    const widthInMM = parseDimension(ratioWidth) / 0.0393701; // Convert inches to mm
    const pixelPitch = (widthInMM / pixelWidth).toFixed(2);
    const ppi = (25.4 / pixelPitch).toFixed(2); // Convert mm to inches and calculate PPI
    return { pixelPitch, ppi };
  };

  const { pixelPitch, ppi } = calculatePixelPitch();

  const calculateViewingDistance = () => {
    const pixelPitch = calculatePixelPitch(); // in mm
    const pixelPitchMeters = (pixelPitch.pixelPitch * 3.28084).toFixed(2); // Convert meters to feet
    return (pixelPitchMeters); 
  };

  const calculateHeightForAspectRatio = (aspectRatio) => {
    const width = parseDimension(ratioWidth);
    if (width) {
      const [w, h] = aspectRatio.split(':').map(Number);
      const height = (width * h) / w;
      const heightInFeet = `${(height / 12).toFixed(2)}ft`;
      setRatioHeight(heightInFeet);
      setPixelWidth(1920);
      setPixelHeight(Math.round((1920 * h) / w));
      updateFootLamberts(lumens, width, height, screenGain);
    }
  };

  const calculateWidthForAspectRatio = (aspectRatio) => {
    const height = parseDimension(ratioHeight);
    if (height) {
      const [w, h] = aspectRatio.split(':').map(Number);
      const width = (height * w) / h;
      const widthInFeet = `${(width / 12).toFixed(2)}ft`;
      setRatioWidth(widthInFeet);
      setPixelHeight(1080);
      setPixelWidth(Math.round((1080 * w) / h));
      updateFootLamberts(lumens, width, height, screenGain);
    }
  };

  const canvasRef = useRef(null);
  const previewSize = 200;

  useEffect(() => {
    drawPreview();
    drawVisualization();
  }, [pixelWidth, pixelHeight, throwRatio, throwDistance, ratioWidth, ratioHeight, lumens, screenGain]);

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

    // Determine the scale factor
    const maxDistance = parseFloat(throwDistance);
    const maxWidth = screenWidthFeet;
    const scaleFactor = Math.min(
      (visualizationSize * 0.8) / maxDistance,
      (visualizationSize * 0.8) / maxWidth
    );

    // Draw the screen
    const distance = maxDistance * scaleFactor; // Adjust the scaling factor
    const screenHeight = 50; // fixed height for visualization
    const screenWidth = screenWidthFeet * scaleFactor; // scale the width appropriately
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

    const drawText = (ctx, text, x, y, fontSize = '16px', color = 'black') => {
        ctx.fillStyle = color;
        ctx.font = `${fontSize} Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    };

    // Draw the test pattern (grid)
    const gridSize = pixelHeight / 4;
    const gridRows = Math.ceil(pixelHeight / gridSize);
    const gridCols = Math.ceil(pixelWidth / gridSize);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    // Draw vertical grid lines
    for (let col = 0; col <= gridCols; col++) {
        const x = col * gridSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, pixelHeight);
        ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let row = 0; row <= gridRows; row++) {
        const y = row * gridSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(pixelWidth, y);
        ctx.stroke();
    }

    // Draw the red circle in the center spanning the height
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(pixelWidth / 2, pixelHeight / 2, pixelHeight / 2, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw the red border around all edges
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, pixelWidth, pixelHeight);

    // Draw thick vertical and horizontal center lines
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(pixelWidth / 2, 0);
    ctx.lineTo(pixelWidth / 2, pixelHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pixelHeight / 2);
    ctx.lineTo(pixelWidth, pixelHeight / 2);
    ctx.stroke();

    // Draw color bars centered, square, and aligned to the bottom half
    const colors = ['white', 'yellow', 'cyan', 'green', 'magenta', 'red', 'blue', 'black'];
    const numColors = colors.length;
    const barSize = pixelHeight / 10; // Square size for each color bar
    const totalBarWidth = barSize * numColors;
    const barY = (pixelHeight / 2) + (pixelHeight / 6); // Align with the bottom half
    const barStartX = (pixelWidth - totalBarWidth) / 2; // Calculate the starting X position

    // Draw each color bar with a grey border
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'grey';
    colors.forEach((color, index) => {
        ctx.fillStyle = color;
        const x = barStartX + index * barSize;
        ctx.fillRect(x, barY, barSize, barSize);
        ctx.strokeRect(x, barY, barSize, barSize);
    });

    // Display the resolution, aspect ratio, and pixel pitch
    const fontSize = pixelHeight / 16; // 1/16 of the size of the image height
    drawText(ctx, testPatternName, pixelWidth / 2, pixelHeight / 3, `${fontSize}px`);
    drawText(ctx, `${pixelWidth}px x ${pixelHeight}px`, pixelWidth / 2, pixelHeight / 2.3, `${fontSize}px`);
    const aspectRatioText = `${Math.round(pixelWidth / gcd(pixelWidth, pixelHeight))}:${Math.round(pixelHeight / gcd(pixelWidth, pixelHeight))} (${(pixelWidth / pixelHeight).toFixed(2)}:1)`;
    drawText(ctx, `Aspect Ratio: ${aspectRatioText}`, pixelWidth / 2, pixelHeight / 2 + fontSize, `${fontSize / 2}px`);
    const pixelPitch = (parseDimension(ratioWidth) / 0.0393701 / pixelWidth).toFixed(2);
    drawText(ctx, `Pixel Pitch: ${pixelPitch} mm`, pixelWidth / 2, pixelHeight / 2 + 1.5 * fontSize, `${fontSize / 2}px`);
    drawText(ctx, `Surface Dimension: ${ratioWidth} x ${ratioHeight}`, pixelWidth / 2, pixelHeight / 2 + 2 * fontSize, `${fontSize / 2}px`);

    // Download the test pattern as an image
    const link = document.createElement('a');
    link.download = `${testPatternName.replace(/ /g, '_')}_${pixelWidth}x${pixelHeight}.png`;
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
          <Button onClick={() => calculateHeightForAspectRatio("16:9")}>16:9</Button>
          <Button onClick={() => calculateHeightForAspectRatio("16:10")}>16:10</Button>
          <Button onClick={() => calculateHeightForAspectRatio("4:3")}>4:3</Button>
          <Button onClick={() => calculateHeightForAspectRatio("2:1")}>2:1</Button>
          <Button onClick={() => calculateHeightForAspectRatio("1:1")}>1:1</Button>
        </InputGroup>
        <InputGroup>
          <Label>Height:</Label>
          <Input type="text" value={ratioHeight} onChange={handleRatioHeightChange} />
          <Button onClick={() => calculateWidthForAspectRatio("16:9")}>16:9</Button>
          <Button onClick={() => calculateWidthForAspectRatio("16:10")}>16:10</Button>
          <Button onClick={() => calculateWidthForAspectRatio("4:3")}>4:3</Button>
          <Button onClick={() => calculateWidthForAspectRatio("2:1")}>2:1</Button>
          <Button onClick={() => calculateWidthForAspectRatio("1:1")}>1:1</Button>
        </InputGroup>
      </Section>
      
      <Section>
        <SubTitle>Projector/Surface Resolution</SubTitle>
        <InputGroup>
          <Label>Pixel Width:</Label>
          <Input type="number" value={pixelWidth} onChange={handlePixelWidthChange} />
          <Inputcheck type="checkbox" checked={lockWidth} onChange={(e) => setLockWidth(e.target.checked)} />
          <Label>Lock</Label>
        </InputGroup>
        <InputGroup>
          <Label>Pixel Height:</Label>
          <Input type="number" value={pixelHeight} onChange={handlePixelHeightChange} />
          <Inputcheck type="checkbox" checked={lockHeight} onChange={(e) => setLockHeight(e.target.checked)} />
          <Label>Lock</Label>
        </InputGroup>
        <SubTitle>Aspect Ratio: {displayRatio()}</SubTitle>
        <SubTitle>Pixel Pitch: {pixelPitch} mm ({ppi} PPI)</SubTitle>
        <SmallText>Closest Optimal Viewing Distance: {calculateViewingDistance()} ft</SmallText>
        <InputGroup>
          <Label>Lumens:</Label>
          <Input type="number" value={lumens} onChange={handleLumensChange} step="1" />
          <Button onClick={() => setLumensForFootLamberts(16)}>16fL</Button>
          <Button onClick={() => setLumensForFootLamberts(32)}>32fL</Button>
          <Button onClick={() => setLumensForFootLamberts(48)}>48fL</Button>
        </InputGroup>
        <InputGroup>
          <Label>Screen Gain:</Label>
          <Input type="number" value={screenGain} onChange={handleScreenGainChange} step="0.1" />
        </InputGroup>
        <SubTitle>
          Foot Lamberts: <FootLambertsDisplay value={footLamberts}>{footLamberts} fL</FootLambertsDisplay>
        </SubTitle>
        <CanvasWrapper>
          <canvas ref={canvasRef} width={previewSize} height={previewSize}></canvas>
        </CanvasWrapper>
        <InputGroup>
          <Input2 type="text" value={testPatternName} onChange={(e) => setTestPatternName(e.target.value)} placeholder="Test Pattern Name" />
          <Button onClick={generateTestPattern}>Download</Button>
        </InputGroup>
      </Section>

      <Section>
        <AspectRatioDrawer 
          ratioWidth={ratioWidth} 
          ratioHeight={ratioHeight} 
          setRatioWidth={setRatioWidth} 
          setRatioHeight={setRatioHeight}
          pixelWidth={pixelWidth}
          pixelHeight={pixelHeight}
          setPixelWidth={setPixelWidth}
          setPixelHeight={setPixelHeight}
        />
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
      </Section>
      
      <CanvasWrapper>
        <canvas ref={visualizationCanvasRef} width={visualizationSize} height={visualizationSize}></canvas>
      </CanvasWrapper>

      <small>Made by Joe Shea & ChatGPT</small>
    </Container>
  );
};

export default AspectRatioCalculator;
