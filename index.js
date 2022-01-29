require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Contact = require("./models/contact");

//Load middleware
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);
app.use(cors());

morgan.token("postData", (request, response) => {
  return JSON.stringify(request.body);
});

// CREATE CONTACT
app.post("/api/contacts", (request, response, next) => {
  const body = request.body;

  Contact.find({ name: body.name }).then((result) => {
    if (result.length !== 0) {
      return response.status(400).json({
        error: "name must be unique",
      });
    } else {
      const contact = new Contact({
        name: body.name,
        number: body.number,
      });
      contact
        .save()
        .then((savedContact) => response.json(savedContact))
        .catch((error) => next(error));
    }
  });
});

// GET CONTACTS
app.get("/api/contacts", (request, response) => {
  Contact.find({}).then((contacts) => response.json(contacts));
});

// GET INFO
app.get("/info", (request, response) => {
  Contact.find({})
    .then((contacts) => {
      const info = {
        length: contacts.length,
        date: new Date(),
      };

      response.send(
        `<div><p>Phonebook has info for ${info.length} people</p><p>${info.date}</p></div>`
      );
    })
    .catch((error) => next(error));
});

// GET SPECIFIC CONTACT
app.get("/api/contacts/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then((contact) => {
      if (contact) {
        response.json(contact);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

//UPDATE CONTACT
app.put("/api/contacts/:id", (request, response, next) => {
  const body = request.body;
  const contact = {
    name: body.name,
    number: body.number,
  };

  Contact.findByIdAndUpdate(request.params.id, contact, {
    new: true,
    runValidators: true,
  })
    .then((updatedContact) => {
      if (updatedContact) {
        response.json(updatedContact);
      } else {
        next(updatedContact);
      }
    })
    .catch((error) => next(error));
});

// DELETE CONTACT
app.delete("/api/contacts/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then((result) => {
      console.log(result);
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

//EROR HANDLER
const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

//LISTEN TO APP
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
