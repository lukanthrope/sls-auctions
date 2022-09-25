const { getEndedAuctions } = require('../lib/getEndedAuctions');
const { closeAuction } = require('../lib/closeAuction');

async function processAuctions(event, context) {
  const auctionsToClose = await getEndedAuctions();

  console.log(auctionsToClose);
  const closingAuctionsPromises = auctionsToClose.map(it => closeAuction(it));
  await Promise.all(closingAuctionsPromises);

  return { closed: closingAuctionsPromises.length };
}

module.exports.handler = processAuctions;
