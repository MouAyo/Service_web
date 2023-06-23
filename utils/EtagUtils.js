const crypto = require('crypto');

function generateETag(data) {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash}"`;
}

module.exports = { generateETag };
