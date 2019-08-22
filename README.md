# Hotel Pasteur Display API


## Installation

    npm install # Install the dependencies
    cp .env.example .env # Create a configuration file

.env file needs to be edited then you can launch the API

    npm start


## API Routes

In order to request the API, you have to be authenticated by the API with the x-access-token in HEADER of the request.

### Users routes :
| Path | HTTP Method | Parameters | Role |
|--|--|--|--|
| /users/register | POST | {login, email, password} | Create a new user |
| /users/authenticate | POST | {login, password} | Login and generate a token |
| /users | GET |  | Get all users |
| /users/:id | GET |  | Get a user |
| /users/:id | PUT | {login, email, password} | Update a user |
| /users/:id | DELETE |  | Delete a user |


### Displays routes :
| Path | HTTP Method | Parameters | Role |
|--|--|--|--|
| /displays | GET |  | Get all displays |
| /displays | POST | {name, message, espId} | Create a new display |
| /displays/:id | GET |  | Get a display |
| /displays/:id | PUT | {name, message, espId} | Update a display |
| /displays/:id | DELETE |  | Delete a display |
| /displays/addOwner/:id | POST | {ownerId} | Add a new owner to a display |
| /displays/deleteOwner/:id | POST | {ownerId} | Delete an owner of a display |
| /displays/declare/:espid | GET |  | Add owner if exist otherwise create a new one |

### Logs routes:
| Path | HTTP Method | Parameters | Role |
|--|--|--|--|
|/logs/:date| GET | | Get the log of a specific day. The date is formated YYYYMMDD.


## API Routes
In the folder *scripts* there are several scripts : 

 - **createAdmin.js** : Create a new admin in the mongo database with the role '*admin*'
 - **authUser.js** : Authenticate a user, generate a JWT token
