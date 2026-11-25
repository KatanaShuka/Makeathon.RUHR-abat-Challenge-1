const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    this.on('getTours', async (req) => {
        const { Tour } = this.entities;
        return cds.ql.SELECT.from(Tour);
    });

    this.on('READ', 'TourContainer', async () => {
        const db = await cds.connect.to('db');
        return db.run(cds.ql.SELECT.from('tour_container'));
    });

    this.on('READ', 'TourSpedition', async () => {
        const db = await cds.connect.to('db');
        return db.run(cds.ql.SELECT.from('tour_spedition'));
    });
});
