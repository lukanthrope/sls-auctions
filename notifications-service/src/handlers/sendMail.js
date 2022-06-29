async function sendMail(event, context) {
  console.log(event);
  return {
    event
  };
}

module.exports.handler = sendMail;
