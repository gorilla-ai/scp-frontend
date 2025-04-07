import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'


const log = require('loglevel').getLogger('vbda/components/analysis/node')

class Node extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        contentClassName: PropTypes.string,
        defaultImage: PropTypes.string,
        labelData: PropTypes.objectOf(PropTypes.shape({
            props: PropTypes.object
        })),
        nodeData: PropTypes.shape({
            props: PropTypes.object,
            images: PropTypes.arrayOf(PropTypes.string)
        })
    };

    static defaultProps = {
        labelData: {},
        nodeData: {}
    };

    render() {
        const {
            className, contentClassName,
            defaultImage,
            labelData, nodeData: {propsReadable: nodeProps, images
        }} = this.props
        const allProps = [nodeProps, ..._.map(labelData, 'propsReadable')]
        const props = _.reduce(_.merge({}, ...allProps), (acc, v, k)=>{
            if (v==null) {
                return acc
            }
            return [
                ...acc,
                    {name:k, val:v}
            ]
        }, [])
        //const images = ['https://static.wixstatic.com/media/812313_d85a13812e6b4a7fb6c1194cf4113312.png/v1/fill/w_126,h_126,al_c,usm_0.66_1.00_0.01/812313_d85a13812e6b4a7fb6c1194cf4113312.png']
        const hasImages = !_.isEmpty(images)
        const profileImages = !hasImages && defaultImage ? [defaultImage] : images

        return <div className={cx(className, 'c-vbda-node')}>
            {
                _.map(profileImages, img=><img className={cx({default:!hasImages})} key={img} src={img} />)
            }
            <div className={cx('c-result', contentClassName)}>
                {
                _.map(props, ({name, val}, idx)=><div key={idx}>
                    <label>{name}</label>
                    <div>{val+''}</div>
                </div>)
            }
            </div>
        </div>
    }
}

export default Node