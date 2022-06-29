const AWS = require('aws-sdk');
const createError = require('http-errors');

const { commonPublicMiddleware } = require('../lib/commonMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getAuctionById = async (id) => {
  let auction;

  try {
    const result = await dynamodb.get({ 
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id }, 
    }).promise();

    auction = result.Item; 
  } catch(error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) throw createError.NotFound(`No auction with ${id} found`);
  return auction;
};

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);
  
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

module.exports = {
  handler: commonPublicMiddleware(getAuction),
  getAuctionById,
}
