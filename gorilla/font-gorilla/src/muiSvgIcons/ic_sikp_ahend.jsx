import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import dim from '../dim/ic_sikp_ahend';

function XmlIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d={dim} />
    </SvgIcon>
  );
}

export default XmlIcon;
