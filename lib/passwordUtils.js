const bcrypt = require("bcrypt");
const saltRounds = 10;
// Hash the password using bcrypt
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};
// Validate the hash of password
const validatePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports.hashPassword = hashPassword;
module.exports.validatePassword = validatePassword;
