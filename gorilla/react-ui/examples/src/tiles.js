import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'

import {Tiles, Image, ImageGallery, Popover} from 'core/components'
import ah from 'core/utils/ajax-helper'

import createExample from './example-factory'

const IMAGES = [
    'bs', 'camera', 'car', 'drug', 'email', 'fb_messenger',
    'goods', 'gun', 'home', 'ic_airplane', 'ic_alert_2', 'ic_bs',
    'ic_cam_2', 'ic_cam_3', 'ic_car_2', 'ic_case', 'ic_creditcard', 'ic_database',
    'ic_drug', 'ic_email', 'ic_etag', 'ic_etag_gate', 'ic_globe', 'ic_goods',
    'ic_gun', 'ic_help', 'ic_home', 'ic_info', 'ic_ip', 'ip',
    'landline', 'line', 'mobile', 'parking', 'person'
]

ah.setupPrefix('https://api.themoviedb.org/')

let Examples = {}

const DivBase = ({id}) => <div className='c-padding'>
    <b>Welcome To {id}'s World!</b>
</div>
DivBase.propTypes = {
    id: PropTypes.string
}

Examples.FixedNumberedTiles = class extends React.Component {
    state = {
        selected: null,
        max: null,
        isLast: false,
        hasMore: false
    };

    handleClick = (id, {max, total, isLast}) => {
        this.setState({
            selected: id,
            max,
            isLast,
            hasMore: total>max
        })
    };

    render() {
        return <Tiles
            id='fixed'
            base={DivBase}
            itemSize={{
                width: 100,
                height: 100
            }}
            items={_.map(_.range(20), i=>({id:i+''}))}
            spacing={5}
            unit='px'
            max={6}
            overlay={(max, total)=>{
                return <div>{total-max} more items!</div>
            }}
            onClick={this.handleClick} />
    }
}

Examples.AutoImageTiles = class extends React.Component {
    state = {
        selected: null,
        max: null,
        isLast: false,
        hasMore: false
    };

    handleClick = (id, {max, total, isLast}) => {
        this.setState({
            selected: id,
            max,
            isLast,
            hasMore: total>max
        })
    };

    openPopover = (id, data, evt) => {
        Popover.openId(
            'my-popover-id',
            evt,
            <div className='c-box'>
                <header>{id}</header>
                <div className='content c-result aligned'>
                    {
                        _.map(data, (v, k)=><div key={k}>
                            <label>{k}</label>
                            <div>{v+''}</div>
                        </div>)
                    }
                </div>
            </div>,
            {pointy:true}
        )
    };

    closePopover = () => {
        Popover.closeId('my-popover-id')
    };

    render() {
        return <Tiles
            id='auto'
            base='img'
            itemSize={{
                width: 30,
                height: 20
            }}
            unit='%'
            spacing={5}
            items={_.map(IMAGES, item=>({id:item, src:`/images/tiles/${item}.png`}))}
            max='auto'
            onClick={this.handleClick}
            onMouseOver={this.openPopover}
            onMouseOut={this.closePopover} />
    }
}

Examples.Image = class extends React.Component {
    render() {
        return <div className='c-flex'>
            <Image
                src='http://image.tmdb.org/t/p/w92/rF5hnmNLfWSWMfpWGoMNptZOIhO.jpg'
                error=':(' />
            <Image
                src='/images/missing.png'
                error=':('
                placeholder='/images/tiles/ic_alert_2.png' />
        </div>
    }
}

Examples.ImageGalleryStaticDataWithAutoPlayAndRepeat = class extends React.Component {
    state = {
        selected: null,
        max: null,
        total: null,
        start: 3,
        prevStart: null,
        moveBackward: false,
        step: null
    };

    handleClick = (id, {max, total}) => {
        this.setState({
            selected: id,
            max,
            total
        })
    };

    handleMove = (start, {before:prevStart, backward:moveBackward, step}) => {
        // start is uncontrolled
        this.setState({
            start,
            prevStart,
            moveBackward,
            step
        })
    };

    render() {
        const {start} = this.state

        return <ImageGallery
            id='gallery-images'
            items={_.map(['missing', ...IMAGES], item=>({id:item, src:`/images/tiles/${item}.png`}))}
            itemProps={{error:'Load failed..', placeholder:'/images/tiles/ic_alert_2.png'}}
            itemSize={{width:120, height:90}}
            unit='px'
            spacing={3}
            defaultStart={start}
            onMove={this.handleMove}
            onClick={this.handleClick}
            repeat
            autoPlay={{
                enabled: true,
                interval: 3000
            }} />
    }
}

const Poster = ({title, src}) => <div className='poster'>
    <div className='img c-flex aic jcc'>
        {src ? <Image
            src={src}
            error={
                <div className='c-flex aic'>
                    <i className='fg fg-alert-1' />
                    Not Available
                </div>
            } /> : null}
    </div>
    <div className='title'>{title}</div>
</div>

Poster.propTypes = {
    src: PropTypes.string,
    title: PropTypes.node
}

Examples.PosterGalleryDynamicData = class extends React.Component {
    state = {
        query: 'ab',
        info: null,
        error: false,
        pages: null,
        total: null,
        page: 1,
        _data: []
    };

    componentDidMount() {
        this.loadList()
    }

    loadList = (newState) => {
        const {query} = this.state
        this.setState({...newState, /*_data:[], */info:'Loading...', error:false}, () => {
            let {page} = this.state

            ah.one({
                url: '3/search/movie',
                data: {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query,
                    page
                }}, {showProgress:false})
                .then(({results:list=[], total_results:total=0, total_pages:pages=null}) => {
                    if (total === 0) {
                        this.setState({info:'No movies found!', pages:null})
                        return
                    }

                    this.setState({
                        info: null,
                        total,
                        _data: _.map(list, ({id, title, poster_path})=>({
                            id: id+'',
                            title,
                            src: `http://image.tmdb.org/t/p/w92${poster_path}`
                        })),
                        pages
                    })
                })
                .catch(err => {
                    console.error(err)
                    this.setState({info:err.message, error:true})
                })
        })
    };

    handleMove = (start, {backward}) => {
        const {page} = this.state
        this.loadList({page:(backward?page-1:page+1)})
    };

    render() {
        const {page, _data, total} = this.state

        return <ImageGallery
            id='gallery-posters'
            base={Poster}
            items={_data}
            itemSize={{width:25, height:40}}
            unit='%'
            spacing={5}
            start={0}
            hasPrev={page>1}
            hasNext={total-(page*20)>0}
            onMove={this.handleMove} />
    }
}


export default class extends React.Component {
    render() {
        return <div id='example-tiles'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

