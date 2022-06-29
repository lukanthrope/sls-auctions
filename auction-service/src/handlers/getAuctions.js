const AWS = require('aws-sdk');
const createError = require('http-errors');
const validator = require('@middy/validator');

const { commonPublicMiddleware } = require('../lib/commonMiddleware');
const getAuctionsSchema = require('../lib/schemas/getAuctionsSchema');

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;

  try {
    const result = await dynamodb.query({ 
      TableName: process.env.AUCTIONS_TABLE_NAME,
      IndexName: 'statusAndEndDate',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeValues: {
        ':status': status,
      },
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    }).promise();

    auctions = result.Items; 
  } catch(error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

module.exports.handler = commonPublicMiddleware(getAuctions)
  .use(validator({
      inputSchema: getAuctionsSchema,
      ajvOptions: {
        useDefaults: true,
        strict: false,
      },
    }),
  );
