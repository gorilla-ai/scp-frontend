import React from 'react';
import cn from 'classnames';

import { Modal, makeStyles } from '@material-ui/core';
import LoopIcon from '@material-ui/icons/Loop';


// TODO: Custom Functions
const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 70,
    color: '#fff',
    borderRadius: '50%',
    backgroundColor: '#343a40',
    boxShadow: theme.shadows[5],
    animation: `rotate360 infinite 2s linear`
  }
}));

// TODO: Component
export default function LoadingMask() {
  const classes = useStyles();

  return (
    <Modal disablePortal disableEnforceFocus disableAutoFocus open className={ classes.modal }>
      <div className={ classes.content }>
        <LoopIcon fontSize="inherit" />
      </div>
    </Modal>
  );
}
