import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import im from 'object-path-immutable'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'


const SIMPLE_VALUE_PROP =
    PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])

let log = require('loglevel').getLogger('core/components/input')

function getAddressList() {
    return ah.one({
        url: `${PORTAL_API}/address`,
        type: 'GET',
        contentType: 'application/json'
    })
        .then(data => {
            // console.log(data)
            return data
        })
}

class Address extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        value: SIMPLE_VALUE_PROP,
        placeholder: SIMPLE_VALUE_PROP,
        onChange: PropTypes.func
    };

    constructor(props, context) {
        super(props, context);
        this.loadAddressData()
        this.state = {};
    }

    loadAddressData = () => {
        getAddressList()
            .then((response) => {
                let addressList
                let cityList = {}
                addressList = _.map(response, (zones, key) => {
                    cityList[key] = _.map(zones, (zone) => {
                        return {value: zone, text: zone}
                    })
                    return {value: key, text: key}
                })
                this.setState({addressList, cityList})
            })
    };

    onChange = (key, value) => {
        const {onChange} = this.props
        const {data} = this.props
        onChange(im.set(data, key, value))
    };

    render() {
        const {addressList, cityList} = this.state
        const {props: {cityIndex, zoneIndex, addrIndex}} = this.props
        let {data} = this.props
        return <div>
            <label className={'required'}>戶籍地</label>
            <div>
                <DropDownList list={addressList}
                              onChange={(value) => {
                                  this.onChange(cityIndex, value)
                              }}
                              value={data[cityIndex]}
                />
                <DropDownList defaultText='請先選擇縣市'
                              list={cityList[data[cityIndex]]}
                              onChange={(value) => {
                                  this.onChange(zoneIndex, value)
                              }}
                              value={data[zoneIndex]}
                              disabled={data[cityIndex] ? false : true}
                />
                {/*{*/}
                    {/*data[cityIndex] ?*/}
                        {/*<DropDownList defaultText='請先選擇縣市'*/}
                                      {/*list={cityList[data[cityIndex]]}*/}
                                      {/*onChange={(value) => {*/}
                                          {/*this.onChange(zoneIndex, value)*/}
                                      {/*}}*/}
                                      {/*value={data[zoneIndex]}*/}
                                      {/*disabled={data[cityIndex] ? false : true}*/}
                        {/*/>*/}
                        {/*:*/}
                        {/*<DropDownList defaultText='請先選擇縣市'*/}
                                      {/*onChange={(value) => {*/}
                                      {/*}}*/}
                                      {/*value={data[zoneIndex]}*/}
                                      {/*disabled={true}*/}
                        {/*/>*/}
                {/*}*/}
                <Input
                    className='grow'
                    type='text'
                    onChange={(value) => {
                        this.onChange(addrIndex, value)
                    }}
                    value={data[addrIndex]}
                />
            </div>
        </div>
    }
}

export default Address