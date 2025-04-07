import React from 'react';
import Readme from '@GIS_README';

import '@less/welcome.less';

export default function Welcome() {
  return (
    <div className="welcome">
      <h1>GIS Examples</h1>
      <div className="readme" dangerouslySetInnerHTML={{ __html: Readme }} />
    </div>
  );
}
