import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import cx from 'classnames'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let it = null;
// const INIT = {
//   openEdgeManagement: false,
//   openTopology: false,
//   openAccount: false
// };

/**
 * SOC-Configuration
 * @class
 * @author Kenneth Chiao <kennethchiao@ns-guard.com>
 * @summary A react component to show the left menu in SOC-Configuration section
 */
class SocConfig extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showContent: true,
            // ..._.cloneDeep(INIT)
        };

        t = global.chewbaccaI18n.getFixedT(null, 'connections');
        it = global.chewbaccaI18n.getFixedT(null, 'incident');
        this.ah = getInstance('chewbacca');
    }

    /**
     * Toggle the submenu on/off
     * @method
     * @param {object} name - menu to be toggled
     * @param {boolean} val - true/false
     */
    handleOpen = (name, val) => {
        this.setState({
            [name]: !val
        });
    }
    /**
     * Determine the current active path
     * @method
     * @param {object} frame - menu to be toggled
     * @returns boolean value
     */
    getActiveFrame = (frame) => {
        const path = window.location.pathname;
        const pattern = {
            soc: '/SCP/SOC/management'
        };

        return path === pattern[frame];
    }
    /**
     * Toggle (show/hide) the left menu
     * @method
     */
    toggleLeftNav = () => {
        if (this.getActiveFrame('threat')) { //Disable the functionality for Threat Intelligent page
            return;
        }

        this.setState({
            showContent: !this.state.showContent
        });
    };

    downloadLogs = () => {
        const {baseUrl, contextRoot} = this.props;
        const url = `${baseUrl}${contextRoot}/api/common/logs/_export`;
        const requestData = {};

        downloadWithForm(url, {payload: JSON.stringify(requestData)});
    };

    /**
     * Set the menu class name
     * @method
     * @returns {string} - class name
     */
    getClassName = () => {
        return this.state.showContent ? 'fg fg-arrow-left' : 'fg fg-arrow-right';
    };

    render() {
        const {showContent} = this.state;

        return (
            <div className={cx('left-nav', {'collapse': !showContent})}>

                <div className='item frame incident'>
                    <Link to='/SCP/soc/incident'>
                        <span className={`${this.getActiveFrame('incident')}`}>{it('txt-incident-management')}</span>
                    </Link>
                </div>

                <div className='item frame incident-device'>
                    <Link to='/SCP/soc/incident-device'>
                        <span className={`${this.getActiveFrame('incidentDevice')}`}>{it('txt-incident-device-management')}</span>
                    </Link>
                </div>

                <div className='item frame incident-unit'>
                    <Link to='/SCP/soc/incident-unit'>
                        <span className={`${this.getActiveFrame('incidentUnit')}`}>{it('txt-incident-unit-management')}</span>
                    </Link>
                </div>

                <div className='item frame incident-log'>
                    <Link to='/SCP/soc/incident-log'>
                        <span className={`${this.getActiveFrame('incidentLog')}`}>{it('txt-incident-log-management')}</span>
                    </Link>
                </div>

                <div className={cx('expand-collapse', {'not-allowed': this.getActiveFrame('threat')})}
                     onClick={this.toggleLeftNav}>
                    <i className={this.getClassName()}/>
                </div>
            </div>
        )
    }
}

SocConfig.propTypes = {};

export default SocConfig;