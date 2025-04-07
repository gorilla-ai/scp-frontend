import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import dim from '../dim/ic_volume_off';

function XmlIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d={dim} />
    </SvgIcon>
  );
}

export default XmlIcon;
