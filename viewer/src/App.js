import React, { useState } from 'react';
import Box from '@mui/material/Box';

import Map from './components/map.js';
import SettingsDrawer from './components/SettingsDrawer.js';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isShowPmtilesLayer, showPmtilesLayer] = useState(true);
  const [isShowRasterXyzTileLayer, showRasterXyzTileLayer] = useState(false);
  const [isShowCogLayer, showCogLayer] = useState(false);
  const [isShowVectorXyzTileLayer, showVectorXyzTileLayer] = useState(false);
  const [isShowVectorPmtilesLayer, showVectorPmtilesLayer] = useState(false);

  const onChangePmtilesLayer = (isShow) => {
    showPmtilesLayer(isShow);
  }
  const onChagneRasterXyzTileLayer = (isShow) => {
    showRasterXyzTileLayer(isShow);
  }
  const onChagneCogLayer = (isShow) => {
    showCogLayer(isShow);
  }
  const onChagneVectorXyzTileLayer = (isShow) => {
    showVectorXyzTileLayer(isShow);
  }
  const onChagneVectorPmtilesLayer = (isShow) => {
    showVectorPmtilesLayer(isShow);
  }

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Box>
      <Map
        isShowPmtilesLayer={isShowPmtilesLayer}
        isShowRasterXyzTileLayer={isShowRasterXyzTileLayer}
        isShowCogLayer={isShowCogLayer}
        isShowVectorXyzTileLayer={isShowVectorXyzTileLayer}
        isShowVectorPmtilesLayer={isShowVectorPmtilesLayer}
      />

      <SettingsDrawer
        open={drawerOpen}
        handleClose={handleDrawerClose}
        onChangePmtilesLayer={onChangePmtilesLayer}
        onChagneRasterXyzTileLayer={onChagneRasterXyzTileLayer}
        onChagneCogLayer={onChagneCogLayer}
        onChagneVectorXyzTileLayer={onChagneVectorXyzTileLayer}
        onChagneVectorPmtilesLayer={onChagneVectorPmtilesLayer}
      />
    </Box >
  );
}

export default App;
