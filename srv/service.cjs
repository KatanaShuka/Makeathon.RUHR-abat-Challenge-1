const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    this.on('getTours', async (req) => {
        const { Tour } = this.entities;
        return DynamicsCompressorNode.ql.SELECT.from(Tour);
    });
});

