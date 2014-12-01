var express = require('express')
  , pg = require('pg')
  , config = require('../config/config')
  , router = express.Router()

var tables = {
  mda: 'solutions_mda',
  mde: 'solutions_mde',
  dnr: 'solutions_dnr',
  Nitrogen: 'causes_nitrogen',
  Phosphorus: 'causes_phosphorus',
  Sediment: 'causes_sediment'
}

var goal_key = {
  Nitrogen: 'tn_target',
  Phosphorus: 'tp_target',
  Sediment: 'ts_target'
}

/* GET home page. */
router.get('/', function(req, res) {
  res.json({name: 'BayStat Data API'})
})

router.get('/solutions', function(req, res) {
  var parameters = []
  var qry = 'select * from '
  qry += tables[req.query.agency]
  qry += ' where basin_name = $1 and best_management_practice = $2'
  parameters.push(req.query.basin_name, req.query.best_management_practice)
  pg.connect(config.db, function(err, client, done) {
    client.query(qry, parameters, function(err, result) {
      done()
      res.json(result.rows)
    })
  })
})

router.get('/causes', function(req, res) {
  var parameters = []
  var qry = 'select sum(' + goal_key[req.query.pollution] + '_2017) as milestone2017,sum(' + goal_key[req.query.pollution] + '_2025) as milestone2025, sum(_1985) as sum_1985,sum(_2007) as sum_2007,sum(_2009) as sum_2009,sum(_2010) as sum_2010,sum(_2011) as sum_2011,sum(_2012) as sum_2012,sum(_2013) as sum_2013 from '
  qry += tables[req.query.pollution]

  var where = false
  if (req.query.source !== 'All Causes') {
    qry += ' where source_sector = $1'
    parameters.push(req.query.source)
    if (req.query.source === 'Forest') {
      qry += ' or source_sector = \'Non-Tidal ATM\''
    }
    where = true
  }
  if (req.query.geo !== 'Maryland') {
    qry += where ? ' and where ' : ' where '
    qry += req.query.geo_column + ' = '
    qry += where ? ' $2' : ' $1'
    parameters.push(req.query.geo)
  }

  pg.connect(config.db, function(err, client, done) {
    client.query(qry, parameters, function(err, result) {
      done()
      res.json(result.rows)
    })
  })
})

router.get('/sources', function(req, res) {
  var parameters = []
  var qry = 'select source_sector, sum(_2013) as sum_2013 from '
  qry += tables[req.query.pollution]
  if (req.query.geo !== 'Maryland') {
    qry += ' where '
    qry += req.query.geo_column + ' = $1'
    parameters.push(req.query.geo)
  }
  qry += ' group by source_sector'
  pg.connect(config.db, function(err, client, done) {
    client.query(qry, parameters, function(err, result) {
      done()
      res.json(result.rows)
    })
  })
})

module.exports = router
