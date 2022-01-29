const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;

console.log(`connecting to ${url}`);

mongoose
  .connect(url)
  .then((result) => console.log(`connected to MongoDB - ${result}`))
  .catch((error) => console.log(`error connecting to MongoDB - ${error}`));

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: function (v) {
        const a = /\d{2}-\d{6,}/.test(v);
        const b = /\d{3}-\d{5,}/.test(v);
        const c = /^[0-9]{8,}$/.test(v);
        return a || b || c;
      },
      message: "Wrong number format",
    },
  },
});

contactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Contact", contactSchema);
