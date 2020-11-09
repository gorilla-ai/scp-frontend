import { createMuiTheme } from '@material-ui/core';

export default function createDefaultTheme() {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#001b34'
      }
    },
    overrides: {
      MuiInputBase: {
        root: {
          color: '#4a4a4a;',
          backgroundColor: '#fff',
          '&.Mui-disabled': {
            color: '#777',
            backgroundColor: '#eee'
          }
        }
      }
    }
  });

  return theme;
}