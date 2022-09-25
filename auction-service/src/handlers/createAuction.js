const { v4 } = require('uuid');
const uuid = v4;
const AWS = require('aws-sdk');
const createError = require('http-errors');

const validator = require('@middy/validator');

const { commonPrivateMiddleware } = require('../lib/commonMiddleware');
const createAuctionSchema = require('../lib/schemas/createAuctionSchema');

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const { email } = event.cognitoPoolClaims;
  const now = new Date();
  const endingAt = new Date();

  endingAt.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    highestBid: {
      amount: 0,
    },
    endingAt: endingAt.toISOString(),
    seller: email,
  };

  try {
    await dynamodb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  } catch(error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: auction,
  };
}

module.exports.handler = commonPrivateMiddleware(createAuction).use(validator({
  inputSchema: createAuctionSchema,
  ajvOptions: {
    useDefaults: true,
    strict: false,
  },
}));
