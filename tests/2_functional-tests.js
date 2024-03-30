const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let test1Id;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: "Test1",
        issue_text: "The first text",
        created_by: "Chai",
        assigned_to: "John",
        status_text: "Sent"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Test1");
        assert.equal(res.body.issue_text, "The first text");
        assert.equal(res.body.created_by, "Chai");
        assert.equal(res.body.assigned_to, "John");
        assert.equal(res.body.status_text, "Sent");
        test1Id = res.body._id;
        done();
      });
  });
  
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: "Test2",
        issue_text: "The first text",
        created_by: "ChaiBot"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Test2");
        assert.equal(res.body.issue_text, "The first text");
        assert.equal(res.body.created_by, "ChaiBot");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        done();
      });
  });
  
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: "Test3",
        created_by: "Chai",
        assigned_to: "John",
        status_text: "Sent"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });
  
  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isTrue(Array.isArray(JSON.parse(res.text)));
        done();
      })
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get('/api/issues/apitest?created_by=Chai')
      .end((err, res) => {
        let arr = JSON.parse(res.text);
        
        assert.equal(res.status, 200);
        assert.isTrue(Array.isArray(arr));
        if (Array.isArray(arr)) {
          for (i = 0; i < arr.length; i++) {
            assert.equal(arr[i].created_by, "Chai");
          }
        }
        done();
      });
  });
  
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get('/api/issues/apitest?status_text=Sent?title=Test1')
      .end((err, res) => {
        let arr = JSON.parse(res.text);
        
        assert.equal(res.status, 200);
        assert.isTrue(Array.isArray(arr));
        if (Array.isArray(arr)) {
          for (i = 0; i < arr.length; i++) {
            assert.equal(arr[i].title, "Test1");
            assert.equal(arr[i].status_text, "Sent");
          }
        }
        done();
      });
  });
  
  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: test1Id,
        issue_title: "Test4"
      })
      .end((err, res) => {
        console.log("TEST 4", res.body)
        console.log(test1Id)
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, test1Id);
        done();
      });
  });
  
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: test1Id,
        issue_title: "Test5",
        issue_text: "A completely new test",
        created_by: "AbsolutelyNotChai"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, test1Id);
        done();
      });
  });
  
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        issue_title: "Test6",
        issue_text: "No text",
        created_by: "Chai"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  }); 
  
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: test1Id
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, test1Id);
        done();
      });
  });
  
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: "banana",
        issue_title: "Test6",
        issue_text: "No text",
        created_by: "Chai"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, "banana");
        done();
      });
  });
  
  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: test1Id
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, test1Id);
        done();
      })
  });
  
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: "banana"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "banana");
        done();
      })
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      })
  }); 
  
});
