const moment = require('moment');
const ProgressBar = require('ascii-progress');
const Table = require('cli-table');
const PromisePool = require('es6-promise-pool');

const { getRemainingSeats } = require('./lib/api');
const DAYS = Number(process.env.DAYS) || 32;

const generatePromises = function* () {
  for (let i = 0; i < DAYS; i++) {
    const date = moment().add(i, 'days');
    yield Promise.all([
      getRemainingSeats('Ankara Gar', 'Kars', 234516259, 234517635, date),
      getRemainingSeats('Kars', 'Ankara Gar', 234517635, 234516259, date)
    ]);
  }
};

const bar = new ProgressBar({
  schema: 'Günler sorgulanıyor(:current/:total) :bar (kalan süre: :eta sn)',
  total: DAYS
});
const table = new Table({ head: ['', 'Ankara => Kars', 'Kars => Ankara']});

const promiseIterator = generatePromises();
const pool = new PromisePool(promiseIterator, 5);

pool.addEventListener('fulfilled', event => {
  bar.tick();
  const result = event.data.result;
  const ankaraKars = result.find(r => r.to == 'Kars');
  const karsAnkara = result.find(r => r.from == 'Kars');
  table.push({ [ankaraKars.date]: [ankaraKars.remainingSeats, karsAnkara.remainingSeats] });
});

pool
  .start()
  .then(() => {
    bar.clear();
    console.log(table.toString()); //eslint-disable-line
  });
