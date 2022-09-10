const request = require('./base');

module.exports = async (url) => {
  const response = await request.get(url);
  return response.data
}