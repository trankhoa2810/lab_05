const mongoose = require("mongoose");
const createContactModel = require("./contact.model");
const createUserModel = require("./user.model");

const db = {};
db.mongoose = mongoose;
db.Contact = createContactModel(mongoose);
db.User = createUserModel(mongoose);

module.exports = db;
