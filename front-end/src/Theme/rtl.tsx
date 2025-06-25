import React from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import stylisPluginRtl from 'stylis-plugin-rtl';

// Create RTL cache for Emotion to flip all styles automatically
const cacheRtl = createCache({
  key: 'mui-rtl',
  stylisPlugins: [stylisPluginRtl],
});

// Create a theme configured for RTL direction globally
const themeRtl = createTheme({
  direction: 'rtl',
});

type RtlProviderProps = { children: React.ReactNode };

export const RtlProvider: React.FC<RtlProviderProps> = ({ children }) => (
  <CacheProvider value={cacheRtl}>
    <ThemeProvider theme={themeRtl}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  </CacheProvider>
);
