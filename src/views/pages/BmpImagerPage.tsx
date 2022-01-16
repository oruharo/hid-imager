import { Grid3x3 } from '@mui/icons-material';
import {
  Box, Button, Card, CardContent, CardMedia, Checkbox, Container, FormControlLabel, FormGroup,
  Grid,
  Paper, Stack, Step, StepButton, StepContent, StepLabel, Stepper, Typography
} from '@mui/material';
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flashConfig, flashFirmware } from '../../flash/useHid';
import { PageTemplate } from '../templates/PageTemplate';


const TextLabel: React.FC<{ caption: string }> = ({ children, caption }) => {
  return (<>
    <Typography variant="caption" color="text.secondary" >
      {caption}
    </Typography>
    <Typography gutterBottom variant="body1" component="div">
      {children}
    </Typography>
  </>);
};


const Console: React.VFC<{ stdout: string }> = ({ stdout }) => {
  const scrollBottomRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollTop = scrollBottomRef.current.scrollHeight;
    }
  }, [stdout]);
  // useLayoutEffect(() => {
  //   scrollBottomRef?.current?.scrollIntoView();
  // }, []);

  return (
    <Box component="textarea" readOnly ref={scrollBottomRef}
      sx={{
        p: 1,
        height: 250,
        border: "1px solid",
        fontFamily: "Roboto Mono,Monaco,Bitstream Vera Sans Mono,Lucida Console,Terminal,Consolas,Liberation Mono,DejaVu Sans Mono,Courier New,monospace",
        whiteSpace: "pre-wrap",
        overflowY: "auto",
        resize: "none",
        fontSize: "12px",
        display: "block",
        backgroundColor: "#222222",
        color: "#f7f7f7",
      }} value={stdout} />
  );
}




function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleStep = (n: number) => {
    setActiveStep(n);
  };

  // const handleReset = () => {
  //   setActiveStep(0);
  // };

  const [console, setConsole] = useState(
    "bbbbbbbbbbbbbbbbbbbbbbb\n" +
    "bbbbbbbbbbbbbbbbbbbbbbb\n"

  );

  const consoleOut = (str: string) => {
    setConsole((cons) => cons + str);
  }

  const flashBootLoader = async () => {
    await flashFirmware("bootloader/ble_micro_pro_bootloader_0_11_0", (progress: number) => { });
  }

  const flashApplicationFirmware = async () => {
    await flashFirmware("application/cocot46_default_0_11_0", (progress: number) => { });
  }

  const flashConfigFiles = () => {
    flashConfig();
  }

  const usbTest = async () => {
    const selectedDevice = await navigator.usb.requestDevice({ filters: [] });
    if (!selectedDevice) {
      return {
        success: false,
        error: 'The user did not select any device.',
      };
    }
    await selectedDevice.open();
  }


  return (
    <Container maxWidth="md">
      <Stack direction="column">
        <Stack direction="row" maxWidth="md">
          <Card sx={{ minWidth: 200, maxWidth: 200 }}>
            <CardMedia
              component="img"
              image="https://user-images.githubusercontent.com/88039287/130355466-f4b49741-5ca4-40cb-bde0-aaf9d45f38c8.jpg"
              alt="cocot46"
            />
            <CardContent>
              <TextLabel caption="Keyboard">cocot46</TextLabel>
              <TextLabel caption="Development board">BLE Pro Micro</TextLabel>
              <TextLabel caption="MCU">NRF52840</TextLabel>
            </CardContent>
          </Card>

          <Paper sx={{ px: 4, py: 1, flexGrow: 1 }}>
            <Typography variant="h4" component="div">Flashing Your Keyboard</Typography>
            <Stepper nonLinear activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
              <Step completed={true}>
                <StepLabel>
                  Connect the USB cable
                  <Box component="img" sx={{ width: 60 }} src={"/cable.dio.svg"} alt="USB cable" />
                </StepLabel>
              </Step>
              <Step>
                <StepButton color="inherit" onClick={() => handleStep(1)}>Flash the bootloader</StepButton>
                <StepContent>
                  https://github.com/sekigon-gonnoc/BLE-Micro-Pro-WebConfigurator/blob/master/static/bootloader/ble_micro_pro_bootloader_0_11_0.bin?raw=true
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button variant="contained" onClick={flashBootLoader} sx={{ mt: 1, mr: 1 }}>Flash</Button>
                      <Button onClick={handleNext} sx={{ mt: 1, mr: 1 }}>Skip</Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
              <Step>
                <StepButton color="inherit" onClick={() => handleStep(2)}>Flash the application firmware</StepButton>
                <StepContent>
                  <Typography></Typography>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button variant="contained" onClick={flashApplicationFirmware} sx={{ mt: 1, mr: 1 }}>Flash</Button>
                      <Button onClick={handleNext} sx={{ mt: 1, mr: 1 }}>Skip</Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
              <Step last>
                <StepButton color="inherit" onClick={() => handleStep(3)}>Flash the configuration files</StepButton>
                <StepContent>
                  <FormGroup>
                    <Stack direction="row">
                      <Stack direction="column">
                        <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="CONFIG.JSN" />
                        <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="KEYMAP.JSN" />
                      </Stack>
                      <Stack direction="column">
                        <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="TAPTERM.JSN" />
                        <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="ENCODER.JSN" />
                      </Stack>
                    </Stack>
                  </FormGroup>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button variant="contained" onClick={flashConfigFiles} sx={{ mt: 1, mr: 1 }}>Flash</Button>
                      <Button variant="contained" onClick={usbTest} sx={{ mt: 1, mr: 1 }}>test</Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Paper>
        </Stack>
        <Console stdout={console} />
      </Stack>
    </Container>
  );
}

export const BmpImagerPage: React.VFC = () => {
  console.log('BmpImagerPage');

  return (
    <PageTemplate title="">
      <VerticalLinearStepper />
    </PageTemplate>
  );
};
