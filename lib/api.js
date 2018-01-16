const rp = require('request-promise');

module.exports = {
  getRemainingSeats: (from, to, date) => {
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
          binisIstasyonId: 234516259,
          binisIstasyonu: from,
          inisIstasyonId: 234517635,
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
      .then(response => {
        return {
          from,
          to,
          date: date.format('l'),
          remainingSeats: response.seferSorgulamaSonucList[0].vagonTipleriBosYerUcret.filter(tip => tip.vagonTipId == 11750035651)[0].kalanSayi
        };
      })
      .catch(() => {
        return { from, to, date: date.format('l'), remainingSeats: 0};
      });
  }
};
