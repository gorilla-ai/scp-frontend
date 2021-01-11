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
      MuiTab: {
        root: {
          '&:hover': {
            color: '#fff',
            backgroundColor: '#1a3248 !important'
          }
        },
        textColorPrimary: {
          color: '#fff'
        }
      },
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
      MuiToggleButton: {
        root: {
          color: '#fff',
          backgroundColor: '#1a668c',
          border: '1px solid #4b4b4b',
          '&:hover': {
            color: '#fff',
            backgroundColor: '#069bda !important'
          },
          '&.Mui-selected': {
            color: '#fff',
            backgroundColor: '#069bda'
          },
          '&.Mui-selected:hover': {
            color: '#fff',
            backgroundColor: '#069bda !important'
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
          color: 'rgba(6, 155, 218, 1) !important',
          '&.Mui-disabled': {
            color: 'rgba(217, 217, 217, 0.4)'
          }
        }
      },
      MuiSvgIcon: {
        root: {
          color: '#fff',
          '&.MuiSelect-icon': {
            color: '#fff'
          },
          '&.MuiSelect-icon.Mui-disabled': {
            color: '#666'
          }
        }
      },
      MuiPaper: {
        root: {
          '&.MuiMenu-paper': {
            color: '#fff',
            backgroundColor: '#1f1e1e',
            border: '1px solid #4b4b4b'
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
          },
          '&.MuiListItem-button:hover': {
            backgroundColor: '#1a3248'
          }
        }
      },
      MuiRadio: {
        root: {
          color: '#d9d9d9'
        }
      },
      MuiTableCell: {
        head: {
          fontWeight: 'bold',
          fontSize: '1em',
          backgroundColor: '#000 !important'
        },
        body: {
          color: '#fff',
          fontSize: '1em'
        }
      },
      MuiTableRow: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#1f1e1e'
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#0f0f0f'
          }
        },
        hover: {
          '&:hover': {
            backgroundColor: '#1a3248 !important'
          }
        }
      },
      MuiToolbar: {
        root: {
          color: '#fff !important'
        }
      },
      MuiTablePagination: {
        root: {
          color: '#fff'
        }
      },
      MuiFormControl: {
        root: {
          backgroundColor: '#1f1e1e'
        }
      }
    }
  });

  return theme;
}