const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

module.exports.closeAuction = async (auction) => {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamoDb.update(params).promise();

  const { title, seller, highestBid } = auction;

  const { amount, bidder } = highestBid;

  console.log(process.env.MAIL_QUEUE_URL);
  const notifySeller = sqs.sendMessage({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'Your item has been sold',
      recipient: seller,
      body: `Woo! Your item ${title} has been sold for ${amount}`,
    }),
  }).promise();

  const notifyBidder = sqs.sendMessage({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'You won an auction',
      recipient: bidder,
      body: `What a deal! You got ${title} for ${amount}`,
    }),
  }).promise();

  await Promise.all([notifySeller, notifyBidder]);

  return result;
};
