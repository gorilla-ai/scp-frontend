import es from 'elasticsearch'


const log = require('loglevel').getLogger('server-es')
log.info('loading es module')

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

export default function query(search, db, cb) {
    log.info('search', {search, db})
    
    //db.cypher({search, params}, parse.bind(null, cb))

    let host = db==='local' ? 'localhost:9200' : '192.168.10.36:9200'
    //let {username, password} = connections[host]
    //const dbs = neo4js({server:`http://${host}`, user:username, pass:password})
    
    const client = new es.Client({
        host,
        log: 'trace'
    });
    
    client.search(search, parse.bind(null, cb))
}

