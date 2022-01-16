import { CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React, { Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { MyThemeProvider } from './components/MyThemeProvider';
import { ProgressProvider } from './components/ProgressProvider';
import { BmpImagerPage } from './views/pages/BmpImagerPage';

const Loading: React.VFC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress size={50} />
    </div>
  )
}


function App() {
  console.log('App');
  return (
    <Suspense fallback={<Loading />}>
      <MyThemeProvider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'center', }}>
          <ProgressProvider>
            <HashRouter >
              <Routes>
                <Route path="/" element={<BmpImagerPage />} />
                <Route path="/bmp" element={<BmpImagerPage />} />
              </Routes>
            </HashRouter >
          </ProgressProvider>
        </SnackbarProvider>
      </MyThemeProvider>
    </Suspense>
  );
}

export default App;
