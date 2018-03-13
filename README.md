![logo](/public/images/logo.jpg)

**What it is:**

    A POC demo RESTful API server for student stars.

**The DB has two tables:**

    "student": hold static information about students, e.g. id and name.
    "event": a list of academic, social or behaviroal events that add or substruct student points,
    an event has - studentID <the student id> , type <academic, social or behaviroal> and a value
    of points to add (negative value will remove points)

**Rulles of the game:**

    When query is sent for specific student, all the events of the last 7 days are added up, and the student
    recive a score of points for each point type.
    

**Running:**

    npm install
    MONGO_URL=mongodb://127.0.0.1:27017  npm start

**Requires:**

    A MongDB server

**Examples of use:**

    # Get list of events:
    curl -X GET \
    http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/event

    # Get list of students:
    curl -X GET \
    http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/student

    # Get one student with details (studentId == 123):
    curl -X GET \
    http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/student/123

    # Post a new stodent:
    curl -X POST \
    -H "Content-Type: application/json" \
    http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/student \
    -d '{"id": "123",	"name": "moshe"}'

    # Post a new event:
    curl -X POST \
    -H "Content-Type: application/json" \
    http://studybuddy-mongo-persistent-studybuddy.1d35.starter-us-east-1.openshiftapps.com/api/v1/event \
    -d '{"studentId": "123", "type": "academic", "value": "1024"}'
  
