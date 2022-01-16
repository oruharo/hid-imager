import {
  Box, Container, CssBaseline, Link, Toolbar, Typography
} from "@mui/material";
import AppBar from '@mui/material/AppBar';
import React from "react";
import { ErrorBoundary } from 'react-error-boundary';


export const PageTemplate: React.FC<{ title: string }> = ({ children, title }) => {

  return (
    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900] }}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="body1" >HID Imager</Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', m: 2 }}>

        {/* <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}> */}
        <ErrorBoundary
          FallbackComponent={
            ({ error, resetErrorBoundary }) => {
              return (
                <div>
                  <p>Something went wrong:</p>
                  <pre>{error.message}</pre>
                </div>
              )
            }
          }
        >
          {children}
        </ErrorBoundary>
        <Box pt={4}>
          <Typography variant="body2" color="textSecondary" align="center">
            {"Copyright © "}<Link href="https://github.com/oruharo/hid-imager">HID Imager</Link>{` ${new Date().getFullYear()}.`}
          </Typography>
        </Box>
        {/* </Container> */}
      </Box>
    </Box>
  );
};
