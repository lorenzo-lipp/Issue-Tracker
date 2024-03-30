'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectID = require('mongodb').ObjectID;
const assignmentSchema = new Schema({
  "project": {type: String, required: true, select: false}, 
  "_id": {type: String, required: true},
  "issue_title": {type: String, required: true},
  "issue_text": {type: String, required: true},
  "created_on": {type: String, required: true},
  "updated_on": {type: String, required: true},
  "created_by": {type: String, required: true},
  "assigned_to": {type: String},
  "open": {type: Boolean},
  "status_text": {type: String}
}, {
    versionKey: false
});
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let queries = Object.keys(req.query)
      let searchObj = {
        "project": project
      }
      for (let i = 0; i < queries.length; i++) {
        searchObj[queries[i]] = req.query[queries[i]];
      }
      Assignment.find(searchObj)
        .then(arr => res.json(arr))
        .catch(err => res.json(err));
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let now = new Date();
      now = now.toISOString();
      const createAssignment = new Assignment({
        "project": project,
        "_id": new ObjectID(),
        "issue_title": req.body.issue_title,
        "issue_text": req.body.issue_text,
        "created_on": now,
        "updated_on": now,
        "created_by": req.body.created_by,
        "assigned_to": req.body.assigned_to || '',
        "open": true,
        "status_text": req.body.status_text || ''
      });
      createAssignment.save()
        .then(objectCreated => {
          console.log(objectCreated);
          return res.json(objectCreated);
        })
        .catch((err) => {
          return res.json({ error: 'required field(s) missing' })
        });
      console.log(req.body);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      if (req.body._id === '' || req.body._id === undefined) {
        return res.json({ error: 'missing _id' });
      }
      if (emptyUpdate(req.body, Object.keys(req.body))) {
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id })
      }
      Assignment.findOne({
        "project": project,
        "_id": req.body._id
      }, (err, doc) => {
        if (err || doc === null) {
          return res.json({ error: 'could not update', '_id': req.body._id })
        }
        const now = new Date();
        doc.updated_on = now.toISOString();
        updateDoc(doc, req.body);
        doc.save()
          .then(() => res.json({ result: 'successfully updated', '_id': req.body._id }))
          .catch(() => res.json({ error: 'could not update', '_id': req.body._id }));
      })
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if (req.body._id === '' || req.body._id === undefined) {
        return res.json({ error: 'missing _id' });
      }
      Assignment.findOneAndDelete({
        "project": project,
        "_id": req.body._id
      }, (err, doc) => {
        if (err || doc === null) {
          return res.json({ error: 'could not delete', '_id': req.body._id })
        }
        return res.json({ result: 'successfully deleted', '_id': req.body._id })
      })
    });
    
};

function emptyUpdate(reqBody, properties) {
  for (let i = 0; i < properties.length; i++) {
    if (reqBody[properties[i]] !== '' && reqBody[properties[i]] !== false && properties[i] !== "_id") {
      return false;
    }
  }
  return true;
}

function updateDoc(doc, reqBody) {
  const updateKeys = Object.keys(reqBody);
  for (let i = 0; i < updateKeys.length; i++) {
    if (updateKeys[i] !== "_id" && reqBody[updateKeys[i]] !== "") {
      doc[updateKeys[i]] = reqBody[updateKeys[i]];
    }
  }
}