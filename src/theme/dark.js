import { createMuiTheme } from '@material-ui/core';
import purple from '@material-ui/core/colors/purple';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';

export default function createDarkTheme() {
  const theme = createMuiTheme({
    overrides: {
      MuiInputBase: {
        root: {
          color: '#fff',
          backgroundColor: '#474747',
          '&.Mui-disabled': {
            color: '#fff',
            backgroundColor: '#292828'
          }
        }
      },
      MuiFormControlLabel: {
        label: {
          color: 'rgba(6, 155, 218, 1)',
          '&.Mui-disabled': {
            color: 'rgba(6, 155, 218, 0.5)'
          }
        }
      },
      MuiCheckbox: {
        root: {
          color: 'rgba(217, 217, 217, 1)',
          '&.MuiCheckbox-colorPrimary.Mui-checked': {
            color: 'rgba(6, 155, 218, 1)'
          },
          '&.MuiCheckbox-colorPrimary.Mui-disabled': {
            color: 'rgba(217, 217, 217, 0.2)'
          }
        }
      },
      MuiButtonBase: {
        root: {
          '&.MuiSwitch-colorPrimary.Mui-checked': {
            color: 'rgba(8, 155, 218, 1)'
          },
          '&.MuiSwitch-colorPrimary.Mui-disabled': {
            color: 'rgba(8, 155, 218, 0.5)'
          },
          '&.MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'rgba(8, 155, 218, 1)'
          },
          '&.MuiRadio-colorPrimary.Mui-checked': {
            color: 'rgba(8, 155, 218, 1)'
          },
          '&.MuiRadio-colorPrimary.Mui-disabled': {
            color: 'rgba(8, 155, 218, 0.5)'
          }
        }
      },
      MuiRadio: {
        root: {
          color: '#d9d9d9'
        }
      },
      MuiSwitch: {
        track: {
          backgroundColor: '#fff'
        }
      }
    },
    // palette: {
    //   primary: {
    //     light: '#fff',
    //     main: '#f44336',
    //     dark: '#000'
    //   },
    //   secondary: {
    //     main: '#f44336',
    //   },
    // },
    // typography: { 
    //   useNextVariants: true
    // }
  });

  return theme;
}