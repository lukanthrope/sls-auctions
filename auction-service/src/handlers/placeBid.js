const AWS = require('aws-sdk');
const createError = require('http-errors');

const { commonPrivateMiddleware } = require('../lib/commonMiddleware');
const { getAuctionById } = require('./getAuction');

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.path;
  const { amount } = event.body;
  const { email } = event.cognitoPoolClaims;

  const auction = await getAuctionById(id);

  if (auction.status !== 'OPEN') {
    throw new createError.BadRequest('You cannot bid on closed auctions');
  }

  if (amount <= auction.hightestBid.amount) {
    throw new createError.BadRequest('Bid must be higher');
  }

  if (auction.seller === email) {
    throw new createError.BadRequest('You cannot bid on your own stuff');
  }

  if (auction.hightestBid.bidder === email) {
    throw new createError.BadRequest('You already have the highest bid');
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set hightestBid.amount = :amount, hightestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
    },
    ReturnValues: 'ALL_NEW',
  };

  let updatedAuction;
  
  try {
    const result = await dynamodb.update(params).promise();

    updatedAuction = result.Attributes; 
  } catch(error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: updatedAuction,
  };
}

module.exports.handler = commonPrivateMiddleware(placeBid);
 