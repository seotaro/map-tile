import React, { useState } from 'react';
import Box from '@mui/material/Box';

import Map from './components/map.js';
import SettingsDrawer from './components/SettingsDrawer.js';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isShowPmtilesLayer, showPmtilesLayer] = useState(true);
  const [isShowXyzTileLayer, showXyzTileLayer] = useState(false);
  const [isShowCogLayer, showCogLayer] = useState(false);

  const onChangePmtilesLayer = (isShow) => {
    showPmtilesLayer(isShow);
  }
  const onChagneXyzTileLayer = (isShow) => {
    showXyzTileLayer(isShow);
  }
  const onChagneCogLayer = (isShow) => {
    showCogLayer(isShow);
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
        isShowXyzTileLayer={isShowXyzTileLayer}
        isShowCogLayer={isShowCogLayer}
      />

      <SettingsDrawer
        open={drawerOpen}
        handleClose={handleDrawerClose}
        onChangePmtilesLayer={onChangePmtilesLayer}
        onChagneXyzTileLayer={onChagneXyzTileLayer}
        onChagneCogLayer={onChagneCogLayer}
      />
    </Box >
  );
}

export default App;
