const db = require("../models");

module.exports = function(app) {
  //GET ALL non-hidden checklist items for a user
  app.get("/api/list", (req, res) => {
    db.Checklist.findAll({ where: { user_id: req.user.id, hidden: 0 } })
      .then(data => {
        //Currently returns list, may switch to res.render for HBS
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(500).json(err);
      });
  });

  //GET ALL Completed & Hiddden items: speculative, but possibly useful
  app.get("/api/list/completed", (req, res) => {
    db.Checklist.findAll({
      where: { user_id: req.user.id, completed: 1, hidden: 1 }
    })
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  });

  //GET checklist item
  app.get("/api/list/:id", (req, res) => {
    db.Checklist.findOne({ where: { id: req.params.id } })
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  });

  //POST checklist item
  app.post("/api/list", (req, res) => {
    db.Checklist.create({
      body: req.body.value,
      user_id: req.user.id
    })
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(500).json(err);
      });
  });

  //UPDATE checklist item as complete
  app.put("/api/list/:id", (req, res) => {
    const id = req.params.id;
    db.Checklist.update(
      {
        completed: 1
      },
      {
        where: {
          id: id
        }
      }
    )
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  });

  //UPDATE checklist item as hidden
  app.put("/api/list/:id", (req, res) => {
    const id = req.params.id;
    db.Checklist.update(
      {
        hidden: 1
      },
      {
        where: {
          id: id
        }
      }
    )
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  });
};
