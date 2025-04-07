//export const EMAIL = '^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
export const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
//
export const PHONE = /^[0-9]{10}$/

export const PHONE_INTERNATIONAL = /^[\+]?[0-9]{10,}$/

export const PHONE_WILDCARD = /^[0-9*]{10}$/