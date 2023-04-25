const db = require("../models");
const Manager = db.manager;

// Create and Save a new Manager
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title || !req.body.date || !req.body.amount || !req.body.type) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a record
  const manager = new Manager({
    type: req.body.type,
    title: req.body.title,
    date: req.body.date,
    amount: req.body.amount,
  });

  // Save Manager in the database
  manager
    .save(manager)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Manager."
      });
    });
};

// Retrieve all Manager from the database.
exports.findAll = (req, res) => {
  const fromDate = req.query.fromDate;
  let toDate = req.query.toDate;
  if (toDate) {
    toDate = new Date(toDate);
    toDate.setDate(toDate.getDate() + 1);
  }
  var condition = fromDate ? { date: { $gte: new Date(fromDate), $lte: toDate } } : {};
  const type = req.query.type;
  if (type) {
    condition.type = type;
  }

  Manager.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Manager."
      });
    });
};

// Find a single Manager with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Manager.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Manager with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Manager with id=" + id });
    });
};

// Update a Manager by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Manager.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Manager with id=${id}. Maybe Manager was not found!`
        });
      } else res.send({ message: "Manager was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Manager with id=" + id
      });
    });
};

// Delete a Manager with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Manager.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Manager with id=${id}. Maybe Manager was not found!`
        });
      } else {
        res.send({
          message: "Manager was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Manager with id=" + id
      });
    });
};

// Delete all Manager from the database.
exports.deleteAll = (req, res) => {
  Manager.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Manager were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Manager."
      });
    });
};
