const crypto = require("crypto");
const nodemailer = require("nodemailer");
const SMTPConnection = require("nodemailer/lib/smtp-connection");

/**
 * Returns the full URL used to hit the route
 * @param  {object} req Request object
 * @return {string} The full URL or undefined
 */
function getFullUrl(req) {
  let retval;
  if (req != null) {
    retval = req.protocol + "://" + req.get("host") + req.originalUrl;
  }
  return retval;
}

/**
 * Returns the protocol and host portion of the full URL used to hit the route
 * @param  {object} req Request object
 * @return {string}  <protocol>://<hostname>[:port] portion of the URL
 */
function getProtocolHostUrl(req) {
  let retval;
  if (req != null) {
    retval = req.protocol + "://" + req.get("host");
  }
  return retval;
}

function generateUUID(numberOfBytes) {
  if (numberOfBytes == null || isNaN(numberOfBytes)) numberOfBytes = 16;
  let uuid = crypto.randomBytes(numberOfBytes).toString("hex");
  if (numberOfBytes == 16)
    return (
      uuid.slice(0, 8) +
      "-" +
      uuid.slice(8, 12) +
      "-" +
      uuid.slice(12, 16) +
      "-" +
      uuid.slice(16, 20) +
      "-" +
      uuid.slice(20)
    );
  else return uuid;
}

/**
 *  Creates a 256 byte hash using a key. The comnination of input data and key will always result in the same hash.
 * @see https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/
 * @param {string} dataToHash
 * @param {string} hashKey
 * @returns {string} Hashed  version of dataToHash.
 */
function createHmacSHA256Hash(dataToHash, hashKey) {
  let retval;
  if (dataToHash && hashKey) {
    retval = crypto.createHmac("sha256", hashKey).update(dataToHash).digest("hex");
  }
  return retval;
}

/**
 *  Creates a 256 byte hash of input string
 * @see https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/
 * @param {string} dataToHash
 * @returns {string} Hashed version of dataToHash
 */
function createSHA256Hash(dataToHash) {
  let retval;
  if (dataToHash) retval = crypto.createHash("sha256").update(dataToHash).digest("hex");

  return retval;
}

async function sendConfirmationEmail(req, email, emailVerificationId) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "bootcampyaba@gmail.com",
      pass: "YabaBootcamp2020",
    },
  });

  let targetUrl = `${getProtocolHostUrl(req)}/api/verify/${emailVerificationId}`;
  let html = `
  <div
  style="
    margin: 1em 5em;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #008dd5;
    padding: 2em 0;
    width: 100%;
  "
>
  <table style="width: 100%;">
    <tr style="text-align: center;">
      <h1>Confirm Your Email</h1>
    </tr>
    <tr style="text-align: center;">
      <h3>Thanks for signing up for Y.A.B.A.</h3>
    </tr>
    <tr style="text-align: center;">
      <h4>Please take a moment to confirm your email</h4>
    </tr>
    <tr style="text-align: center;">
      <h4>Just hit the button below and you'll be all set</h4>
    </tr>
    <tr style="text-align: center;">
      <a
        style="
          border: 1px white solid;
          border-radius: 10px;
          padding: 1em;
          margin-top: 1em;
          background-color: #19ceb3;
          text-decoration: none;
        "
        target="_blank"
        href="${targetUrl}"
      >
        CONFIRM EMAIL
      </a>
    </tr>
  </table>
</div>

`;

  let emailInfo = await transporter.sendMail({
    from: '"YABA Bootcamp" <bootcampyaba@gmail.com>',
    to: email,
    subject: "Email Confirmation/Verification",
    text: "Verify/Confirm your email",
    html: html,
  });

  return emailInfo;
}

module.exports = {
  getFullUrl,
  generateUUID,
  createHmacSHA256Hash,
  createSHA256Hash,
  getProtocolHostUrl,
  sendConfirmationEmail,
};