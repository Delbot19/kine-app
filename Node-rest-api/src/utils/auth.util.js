const { hash, compare } = require("bcryptjs");
const hashPassword = async (password) => {
  const passwordHash = await hash(password, 12);
  return passwordHash;
};

const verifyPassword = async (password, hashPassword) => {
  const isValid = await compare(password, hashPassword);
  return isValid;
};

module.exports = { hashPassword, verifyPassword };
