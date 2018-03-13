![logo](/public/images/logo.jpg)

**What it is:**

    A POC demo RESTful API server for student stars.

**Running:**

    npm install
    MONGO_URL=mongodb://127.0.0.1:27017  npm start

**Requires:**

    A MongDB server

**Examples of use:**

    # Get list of events:
    curl -X GET http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/event

    # Get list of students:
    curl -X GET http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/student

    # Get one student with details (studentId == 123):
    curl -X GET http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/student/123

    # Post a new stodent:
    curl -X POST http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/student \
    -d '{"id": "123",	"name": "moshe"}'

    # Post a new event:
    curl -X POST http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/event \
    -d '{"studentId": "123", "type": "academic", "value": "1024"}'
  
