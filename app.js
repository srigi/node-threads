'use strict';

import chalk from 'chalk';
import express from 'express';
import factorial from './factorial';
import logger from 'morgan';
import pg from 'pg';

const app = express();
const port = process.env.PORT || 8000;


app.use(logger('[:status] :method :url (:response-time ms)'));

app.get('/', (req, res) => {
  res.writeHeader(200, {'Content-Type': 'text/html'});
  res.end('Hello world!');
});

app.get('/delay', (req, res) => {
  setTimeout(() => {
    res.writeHeader(200, {'Content-Type': 'text/html'});
    res.end('Hello world!');
  }, 200);
});

app.get('/db/:tld', (req, res) => {
  pg.connect('postgres://dokkunode:password@localhost/dokkunode', (err, client, done) => {
    if (err) {
      console.log(err);
      return res.end('error connecting to database');
    }

    client.query('SELECT * FROM "user" WHERE email LIKE $1 LIMIT 10', [`%.${req.params.tld}%`], (err, result) => {
      done();
      if (err) {
        console.log(err);
        return res.end('error running query');
      }

      res.end(JSON.stringify(result.rows));
    });
  });
})

app.get('/fractal', (req, res) => {
  pg.connect('postgres://dokkunode:password@localhost/dokkunode', (err, client, done) => {
    if (err) {
      console.log(err);
      return res.end('error connecting to database');
    }

    client.query(`
    WITH RECURSIVE q (r, i, rx, ix, g) AS (
      SELECT  x + r::DOUBLE PRECISION * step, y + i::DOUBLE PRECISION * step,
              x + r::DOUBLE PRECISION * step, y + i::DOUBLE PRECISION * step,
              0
      FROM (SELECT      0.25 x, -0.55 y, 0.002 step, r, i
            FROM        generate_series(-40, 40) r
            CROSS JOIN  generate_series(-40, 40) i) q
      UNION ALL
      SELECT  r, i,
              CASE WHEN (rx * rx + ix * ix) < 1E8 THEN (rx * rx + ix * ix) ^ 0.75 * COS(1.5 * ATAN2(ix, rx)) END - 0.2,
              CASE WHEN (rx * rx + ix * ix) < 1E8 THEN (rx * rx + ix * ix) ^ 0.75 * SIN(1.5 * ATAN2(ix, rx)) END,
              g + 1
      FROM    q
      WHERE   rx IS NOT NULL AND g < 99)
    SELECT  ARRAY_TO_STRING(ARRAY_AGG(s ORDER BY r), '')
    FROM (SELECT    i, r, SUBSTRING(' .:-=+*#%@', MAX(g) / 10 + 1, 1) s
          FROM      q
          GROUP BY  i, r) q
    GROUP BY i
    ORDER BY i`, (err, result) => {
      done();
      if (err) {
        console.log(err);
        return res.end('error running query');
      }

      var out = result.rows.reduce((memo, line) => {
        return memo += `${line.array_to_string}\n`;
      }, '')

      res.end(out);
    });
  });
})

app.get('/factorial/:num', (req, res) => {
  res.end('' + factorial(Number(req.params.num)));
});


const socket = app.listen(port, '0.0.0.0', function() {
  const info = socket.address();

  console.log('Started',
    `${chalk.green('app.js')} at`,
    chalk.blue(`${info.address}:${info.port}`));
});
