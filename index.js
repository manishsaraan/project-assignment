require('dotenv').config();

const express = require('express');
const port = process.env.PORT;
const app = express();
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const Bills = require('./models/bill');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

mongoose.connect(process.env.DB);

/**
 * test if a given value is integer
 * look:- https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
 */

function isInt(value) {
  return (
    !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10))
  );
}

app.get('/', async (req, res) => {
  for (let i = 0; i <= 364; i++) {
    let elecCount = Math.floor(Math.random() * (100 - 1 + 1) + 1);
    let AcCount = Math.floor(Math.random() * (500 - 1 + 1) + 1);

    await Bills.create({
      elec: elecCount,
      AC: AcCount,
      ts: '23/08/2019',
    });
  }

  return res.status(200).json({ ok: true });
});

app.get('/records', async (req, res) => {
  try {
    const { count } = req.query;

    // validate count
    if (count && !isInt(count)) {
      return res
        .status(400)
        .json({ ok: false, error: 'wrong format of count' });
    }
    // only return limited records if there is count in query
    const limit = count || 365;
    const cacheKey = `bills_${limit}`;

    const cachedBills = cache.get(cacheKey);

    // check if its in cache, return from cache
    if (cachedBills) {
      return res.json({ ok: true, records: cachedBills });
    }

    const billRecords = await Bills.find({})
      .limit(+limit)
      .sort({ createdAt: -1 })
      .lean();

    // save in cache
    cache.set(cacheKey, billRecords);

    return res.json({ ok: true, records: billRecords });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ ok: false, error: 'something went wrong' });
  }
});

app.listen(port, () => console.log('app is running at port ' + port));
