/**
 * @module prop-types
 * @desc Defines commonly used prop types, as well as prop type generators
 */

import PropTypes from 'prop-types';

import React from 'react';


/**
 * A Simple value prop
 * @typedef {number | string} SIMPLE_VALUE_PROP
 */
export const SIMPLE_VALUE_PROP =
    PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])

/**
 * An array of simple values prop
 * @typedef {SIMPLE_VALUE_PROP[]} SIMPLE_ARRAY_PROP
 * @example [1,2,3]
 * @example ['1','2']
 */
export const SIMPLE_ARRAY_PROP =
    PropTypes.arrayOf(SIMPLE_VALUE_PROP)


/**
 * An object of simple values prop
 * @typedef {Object.<SIMPLE_VALUE_PROP>} SIMPLE_OBJECT_PROP
 * @example {key1:1, key2:'val2'}
 */
export const SIMPLE_OBJECT_PROP =
    PropTypes.objectOf(SIMPLE_VALUE_PROP)


/**
 * A Renderable List
 * @typedef {Array<Object.<value:SIMPLE_VALUE_PROP, text:SIMPLE_VALUE_PROP>>} LIST_PROP
 * @example [{value:2,text:'this is 2'}]
 */
export const LIST_PROP =
    PropTypes.arrayOf(PropTypes.shape({
        value: SIMPLE_VALUE_PROP,
        text: SIMPLE_VALUE_PROP,
        children: PropTypes.node
    }))