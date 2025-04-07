import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import createExample from './example-factory'

let Examples = {}

function formatXml(xml) {
    let formatted = ''
    let reg = /(>)(<)(\/*)/g
    xml = xml.replace(reg, '$1\r\n$2$3')
    let pad = 0
    _.forEach(xml.split('\r\n'), (node) => {
        let indent = 0
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0
        }
        else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1
            }
        }
        else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1
        }
        else {
            indent = 0
        }

        let padding = ''
        for (let i = 0; i < pad; i++) {
            padding += '  '
        }

        formatted += padding + node + '\r\n'
        pad += indent
    })

    return formatted
}


Examples.Buttons = class extends React.Component {
    state = {isPress:[false, false, false, false]};

    click = (index) => {
        let {isPress} = this.state
        let newPress = []
        let len = isPress.length
        for (let i =0; i < len; i++) {
            newPress.push((i===index)?!isPress[i]:isPress[i])
        }
        this.setState({isPress:newPress}, ()=>{
            this.setState({
                $test: formatXml(this.node.innerHTML)
            })
        })
    };

    render() {
        let {isPress} = this.state

        return (
            <div ref={ref=>{ this.node=ref }}>
                <button onClick={this.click.bind(this, 0)}>Primary</button>
                <button className='standard' onClick={this.click.bind(this, 1)}>Standard</button>
                <button disabled onClick={this.click.bind(this, 2)}>Disabled</button>
                <button className='standard' disabled onClick={this.click.bind(this, 3)}>Standard Disabled</button>
            </div>
        )
    }
}


Examples.Radios = class extends React.Component {
    state = {isPress:[false, false]};

    click = (index) => {
        let {isPress} = this.state
        console.log(index)
        console.log(isPress)
        let newPress = []
        let len = isPress.length
        for (let i =0; i < len; i++) {
            newPress.push((i===index))
        }
        this.setState({isPress:newPress}, ()=>{
            this.setState({
                $test: formatXml(this.node.innerHTML)
            })
        })
    };

    render() {
        // let {movie} = this.state
        let {isPress} = this.state

        return (
            <div ref={ref=>{ this.node=ref }}>
                <input type='radio' id='r0' onClick={this.click.bind(this, 0)} checked={isPress[0]} /><label htmlFor='r0'>choose1</label>
                <input type='radio' id='r2' onClick={this.click.bind(this, 1)} checked={isPress[1]} /><label htmlFor='r2'>choose2</label>
                <input type='radio' name='r' disabled /><label htmlFor='r'>Unckecked disabled</label>
                <input type='radio' name='r1' checked disabled /><label htmlFor='r'>Checked disabled</label>
            </div>)
    }
}

Examples.Menus = class extends React.Component {
    state = {isPress:[false, false, false, false, false, false, false, false]};

    click = (index) => {
        let {isPress} = this.state
        let newPress = []
        let len = isPress.length
        for (let i =0; i < len; i++) {
            newPress.push((i===index)?!isPress[i]:isPress[i])
        }
        this.setState({isPress:newPress}, ()=>{
            this.setState({
                $test: formatXml(this.node.innerHTML)
            })
        })
    };

    render() {
        let {isPress} = this.state

        return (
            <div ref={ref=>{ this.node=ref }}>
                <ul className='c-menu'>
                    <li className={cx({'header current':isPress[0], header:!isPress[0]})} onClick={this.click.bind(this, 0)}>Primary Menu</li>
                    <li className={cx({current:isPress[1]})} onClick={this.click.bind(this, 1)}>Item 1</li>
                    <li className={cx({current:isPress[2]})} onClick={this.click.bind(this, 2)}>Item 2</li>
                    <li className='disabled'>Disabled</li>
                </ul>
                <ul className='c-menu plain'>
                    <li className={cx({'header current':isPress[4], header:!isPress[4]})} onClick={this.click.bind(this, 4)}>Plain Menu</li>
                    <li className={cx({current:isPress[5]})} onClick={this.click.bind(this, 5)}>Item 1</li>
                    <li className={cx({current:isPress[6]})} onClick={this.click.bind(this, 6)}>Item 2</li>
                    <li className='disabled'>Disabled</li>
                </ul>
            </div>
        )
    }
}

Examples.Lists = class extends React.Component {
    state = {isPress:[false, false, false, false, false, false, false, false]};

    click = (index) => {
        let {isPress} = this.state
        let newPress = []
        let len = isPress.length
        for (let i =0; i < len; i++) {
            newPress.push((i===index)?!isPress[i]:isPress[i])
        }
        this.setState({isPress:newPress}, ()=>{
            this.setState({
                $test: formatXml(this.node.innerHTML)
            })
        })
    };

    render() {
        let {isPress} = this.state

        return (
            <div ref={ref=>{ this.node=ref }}>
                <ul className='c-menu sub'>
                    <li className={cx({'header current':isPress[0], header:!isPress[0]})} onClick={this.click.bind(this, 0)}>List Title1</li>
                    <li className={cx({current:isPress[1]})} onClick={this.click.bind(this, 1)}>Item 1</li>
                    <li className={cx({current:isPress[2]})} onClick={this.click.bind(this, 2)}>Item 2</li>
                    <li className='disabled'>Disabled</li>
                    <li className={cx({'header current':isPress[4], header:!isPress[4]})} onClick={this.click.bind(this, 4)}>List Title2</li>
                    <li className={cx({current:isPress[5]})} onClick={this.click.bind(this, 5)}>Item 5</li>
                    <li className={cx({current:isPress[6]})} onClick={this.click.bind(this, 6)}>Item 6</li>
                    <li className='disabled'>Disabled</li>
                </ul>
            </div>
        )
    }
}

Examples.Navs = class extends React.Component {
    state = {isPress:[false, false, false, false, false, false, false, false]};

    click = (index) => {
        let {isPress} = this.state
        let newPress = []
        let len = isPress.length
        for (let i =0; i < len; i++) {
            newPress.push((i===index))
        }
        this.setState({isPress:newPress}, ()=>{
            this.setState({
                $test: formatXml(this.node.innerHTML)
            })
        })
    };

    render() {
        let {isPress} = this.state

        return (
            <div ref={ref=>{ this.node=ref }}>
                <div className='c-nav'>
                    <div className={cx({current:isPress[1]})} onClick={this.click.bind(this, 1)}>Item 1</div>
                    <div className={cx({current:isPress[2]})} onClick={this.click.bind(this, 2)}>Item 2</div>
                    <div className={cx({current:isPress[3]})} onClick={this.click.bind(this, 3)}>Item 3</div>
                    <div className={cx({current:isPress[4]})} onClick={this.click.bind(this, 4)}>Item 4</div>
                    <div className={cx({current:isPress[5]})} onClick={this.click.bind(this, 5)}>Item 5</div>
                    <div className={cx({current:isPress[6]})} onClick={this.click.bind(this, 6)}>Item 6</div>
                    <div className={cx({current:isPress[7]})} onClick={this.click.bind(this, 7)}>Item 7</div>
                </div>
            </div>
        )
    }
}

Examples.SubNavs = class extends React.Component {
    state = {isPress:[false, false, false, false, false, false, false, false]};

    click = (index) => {
        let {isPress} = this.state
        let newPress = []
        let len = isPress.length
        for (let i =0; i < len; i++) {
            newPress.push((i===index))
        }
        this.setState({isPress:newPress}, ()=>{
            this.setState({
                $test: formatXml(this.node.innerHTML)
            })
        })
    };

    render() {
        let {isPress} = this.state

        return (
            <div ref={ref=>{ this.node=ref }}>
                <div className='c-nav sub'>
                    <div className={cx({current:isPress[1]})} onClick={this.click.bind(this, 1)}>Item 1</div>
                    <div className={cx({current:isPress[2]})} onClick={this.click.bind(this, 2)}>Item 2</div>
                    <div className={cx({current:isPress[3]})} onClick={this.click.bind(this, 3)}>Item 3</div>
                    <div className={cx({current:isPress[4]})} onClick={this.click.bind(this, 4)}>Item 4</div>
                    <div className={cx({current:isPress[5]})} onClick={this.click.bind(this, 5)}>Item 5</div>
                    <div className={cx({current:isPress[6]})} onClick={this.click.bind(this, 6)}>Item 6</div>
                    <div className={cx({current:isPress[7]})} onClick={this.click.bind(this, 7)}>Item 7</div>
                </div>
            </div>
        )
    }
}

export default class extends React.Component {
    render() {
        return <div>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}