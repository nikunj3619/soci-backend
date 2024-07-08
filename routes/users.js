const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb+srv://gaikwadnikunj2003:Nikunj123@cluster0.knmce0x.mongodb.net/soci?retryWrites=true&w=majority&appName=Cluster0");

const societySchema = mongoose.Schema({
  name: String,
  username: String,
  password: String,
  address: String,
  visitor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "visitors"
    }
  ]
});
societySchema.plugin(plm);
module.exports = mongoose.model("societies", societySchema);