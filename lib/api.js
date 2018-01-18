const rp = require('request-promise');
const moment = require('moment');
const debug = require('debug')('karsrail:api');

module.exports = {
  getRemainingSeats: (from, to, fromId, toId, date) => {
    const options = {
      method: 'POST',
      url: 'https://eybistrm.tcdd.gov.tr/WebServisWeb/rest/EybisRestApplication/seferSorgula',
      headers: {
        'cache-control': 'no-cache',
        authorization: 'mobilProd14:8Jh6g81dP4p72k',
        'content-type': 'application/json'
      },
      body: {
        kanalKodu: '3',
        dil: 0,
        seferSorgulamaKriterWSDVO: {
          binisIstasyonId: fromId,
          binisIstasyonu: from,
          inisIstasyonId: toId,
          inisIstasyonu: to,
          satisKanali: 5,
          seyahatTuru: 1,
          gidisTarih: date.format('MMM D, YYYY HH:mm:ss A'),
          bolgeselGelsin: false,
          islemTipi: 0,
          yolcuSayisi: 2,
          aktarmalarGelsin: true
        }
      },
      json: true,
      timeout: 10000
    };
    return rp(options)
      .then(body => {
        if (!body || !body.seferSorgulamaSonucList) {
          return Promise.reject(new Error('Sonuc cekilemedi'));
        }
        const results = body.seferSorgulamaSonucList[0];

        const requestedWagonType = results.vagonTipleriBosYerUcret.filter(tip => tip.vagonTipId == 11750035651)[0];
        const remainingSeats = requestedWagonType.vagonListesi
          .map(vagon => vagon.bosYer)
          .reduce((a, b) => a + b);

        const availableSeats = requestedWagonType.vagonListesi
          .filter(vagon => vagon.bosYer > 0)
          .map(vagon => {
            return { seats: vagon.bosYer, wagonNumber: vagon.vagonSiraNo };
          });

        return {
          from,
          to,
          date: moment(results.binisTarih, 'MMM D, YYYY HH:mm:ss A').format('l'),
          trDate: moment(results.binisTarih, 'MMM D, YYYY HH:mm:ss A').format('DD/MM/YYYY'),
          remainingSeats: remainingSeats ? remainingSeats : '-',
          availableWagonNumbers: availableSeats || []
        };
      })
      .catch(err => {
        debug(err);
        return { from, to, date: date.add(1, 'days').format('l'), trDate: date.add(1, 'days').format('DD/MM/YYYY'), remainingSeats: '-', availableWagonNumbers: [] };
      });
  }
};
