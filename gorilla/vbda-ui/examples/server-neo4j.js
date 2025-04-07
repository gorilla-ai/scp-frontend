import express from 'express'
import _ from 'lodash'

//import neo4j from 'neo4j'
import neo4js from 'seraph'

const connections = 
{
	'192.168.10.158:7300': {username:'neo4j', password:'gorillakm'},
	'localhost:7474': {username:'neo4j', password:'neo4jft'}
}

//const db = new neo4j.GraphDatabase(`http://${username}:${password}@${host}`)

const log = require('loglevel').getLogger('server-neo4j')
log.info('loading neo4j module')

function parse(cb, err, results) {
	if (err) {
		return cb(err)
	}
	if (!results) {
		return cb('Not found')
	}
	else {
		return cb(null, results)
	}
}

export function query(query, params, raw, db, cb) {
	log.info('query', {query, params, raw, db})
	
	//db.cypher({query, params}, parse.bind(null, cb))

	let host = db==='local' ? 'localhost:7474' : '192.168.10.158:7300'
	let {username, password} = connections[host]
	const dbs = neo4js({server:`http://${host}`, user:username, pass:password})
	
	let func = raw ? 'queryRaw' : 'query'

	dbs[func](query, params, parse.bind(null, cb))
}

/*
MATCH (n:IPv4)-[m]->(o:IPv4)
WHERE n.addr='216.58.200.227'
WITH n, count(DISTINCT m) AS count, o
RETURN n, count, o*/