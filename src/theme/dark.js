import { createMuiTheme } from '@material-ui/core';

export default function createDarkTheme() {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#069bda'
      }
    },
    typography: {
      fontFamily: '"Segoe UI", "微軟正黑體", "新細明體"'
    },
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
      MuiFormLabel: {
        root: {
          color: 'rgba(6, 155, 218, 1)',
          '&.Mui-disabled': {
            color: 'rgba(6, 155, 218, 1)'
          }
        }
      },
      MuiFormControlLabel: {
        label: {
          color: 'rgba(6, 155, 218, 1)',
          '&.Mui-disabled': {
            color: 'rgba(217, 217, 217, 0.4)'
          }
        }
      },
      MuiSvgIcon: {
        root: {
          '&.MuiSelect-icon': {
            color: '#fff'
          },
          '&.MuiSelect-icon.Mui-disabled': {
            color: '#666'
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
          '&.MuiButton-contained.Mui-disabled': {
            color: 'rgba(217, 217, 217, 0.5)'
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
      }
    }
  });

  return theme;
}