import { createMuiTheme } from '@material-ui/core';

export default function createDefaultTheme() {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#001b34'
      }
    },
    typography: {
      fontFamily: '"Segoe UI", "微軟正黑體", "新細明體"'
    },
    overrides: {
      MuiTab: {
        root: {
          '&:hover': {
            color: '#9b9b9b',
            backgroundColor: '#e2ecfd !important'
          }
        },
        textColorPrimary: {
          '&.Mui-selected': {
            color: '#185e9e'
          }
        }
      },
      MuiInputBase: {
        root: {
          color: '#4a4a4a;',
          backgroundColor: '#fff',
          '&.Mui-disabled': {
            color: '#777',
            backgroundColor: '#eee'
          }
        }
      },
      MuiToggleButton: {
        root: {
          color: '#4a4a4a',
          backgroundColor: '#fff',
          '&:hover': {
            color: '#fff',
            backgroundColor: '#001b34 !important'
          },
          '&.Mui-selected': {
            color: '#fff',
            backgroundColor: '#001b34'
          },
          '&.Mui-selected:hover': {
            color: '#fff',
            backgroundColor: '#001b34 !important'
          }
        }
      }
    }
  });

  return theme;
}