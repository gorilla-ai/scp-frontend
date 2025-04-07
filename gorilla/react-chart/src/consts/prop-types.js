/**
 * Defines commonly used prop types, as well as prop type generators
 */

import PropTypes from 'prop-types';

import React from 'react';


/**
 * Data item prop
 */
export const DATA_ITEM_PROP =
    PropTypes.objectOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.object
        ])
    )


/**
 * Single key mapping prop
 */
export const KEY_MAPPING_PROP =
    PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string
    ])

/**
 * Aggregation type
 */
export const AGG_TYPE_PROP =
    PropTypes.oneOf(['count', 'sum', 'avg'])