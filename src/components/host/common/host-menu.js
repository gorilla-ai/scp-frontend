import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Button from '@material-ui/core/Button'

import {BaseDataContext} from '../../common/context'

let t = null;

/**
 * Host common menu component
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the hsot menu
 */
class HostMenu extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    return (
      <React.Fragment>
        <Button id='hostEndpoints' variant='outlined' color='primary' data-cy='hostEndpointsBtn'><Link to='/SCP/host/endpoints'>{t('host.txt-endpoints')}</Link></Button>
        <Button id='hostMalware' variant='outlined' color='primary' data-cy='hostMalwareBtn'><Link to='/SCP/host/malware'>{t('host.txt-malware')}</Link></Button>
        <Button id='hostVulnerabilities' variant='outlined' color='primary' data-cy='hostVulnerabilitiesBtn'><Link to='/SCP/host/vulnerabilities'>{t('host.txt-vulnerabilities')}</Link></Button>
        <Button id='hostInventory' variant='outlined' color='primary' data-cy='hostInventoryBtn'><Link to='/SCP/host/inventory'>{t('host.txt-inventory')}</Link></Button>
        <Button id='hostKbid' variant='outlined' color='primary' data-cy='hostKbidBtn'><Link to='/SCP/host/kbid'>{t('host.txt-kbid')}</Link></Button>
        <Button id='hostGcb' variant='outlined' color='primary' data-cy='hostGcbBtn'><Link to='/SCP/host/gcb'>{t('host.txt-gcb')}</Link></Button>
        <Button id='hostCpe' variant='outlined' color='primary' data-cy='hostCpeBtn'><Link to='/SCP/host/cpe'>{t('host.txt-cpePage')}</Link></Button>
      </React.Fragment>      
    )
  }
}

HostMenu.contextType = BaseDataContext;

HostMenu.propTypes = {
};

export default HostMenu;