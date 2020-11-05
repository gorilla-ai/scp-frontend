import { createMuiTheme } from '@material-ui/core';
import purple from '@material-ui/core/colors/purple';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';

export default function createDefaultTheme() {
  const theme = createMuiTheme({
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
      },
      MuiFormControlLabel: {
        label: {
          color: '#004d93',
          '&.Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.38)'
          }
        }
      },
      MuiCheckbox: {
        root: {
          color: 'rgba(153, 153, 153, 1)',
          '&.MuiCheckbox-colorPrimary.Mui-checked': {
            color: 'rgba(0, 27, 52, 1)'
          },
          '&.MuiCheckbox-colorPrimary.Mui-disabled': {
            color: 'rgba(0, 27, 52, 0.2)'
          }
        }
      },
      MuiButtonBase: {
        root: {
          '&.MuiSwitch-colorPrimary.Mui-checked': {
            color: 'rgba(0, 27, 52, 1)'
          },
          '&.MuiSwitch-colorPrimary.Mui-disabled': {
            color: 'rgba(0, 27, 52, 0.5)'
          },
          '&.MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'rgba(0, 27, 52, 1)'
          },
          '&.MuiRadio-colorPrimary.Mui-checked': {
            color: 'rgba(0, 27, 52, 1)'
          },
          '&.MuiRadio-colorPrimary.Mui-disabled': {
            color: 'rgba(0, 27, 52, 0.5)'
          }
        }
      },
      MuiRadio: {
        root: {
          color: '#999'
        }
      }
    },
    // palette: {
    //   primary: {
    //     light: '#fff',
    //     main: 'rgb(23, 105, 170)',
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