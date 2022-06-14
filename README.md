# 122q

On the come up B)
**The Squad:** Pranav Addepalli, Angela Zhang, Amanda Li, Bhargav Hadya, Brandon Sommerfeld, Esther Cao, Jackson Romero, Lora Zhou, Mengrou Shou

## Getting Started
1. Install [Node.js](https://nodejs.org/en/)
2. Install Node modules within both client and server folders. cd into each and run:
    ```
    % npm install
    ```
3. Install [PostgreSQL](https://www.postgresql.org/download/)
4. Run the following commands to create a user and database:
	```
	% psql
	postgres=# CREATE USER <user> WITH PASSWORD <password>;
	postgres=# CREATE DATABASE <dbname>;
	postgres=# GRANT ALL PRIVILEGES ON DATABASE <dbname> to <user>;
	```
5. Start the database by migrating the schema
	```
	% npx sequelize db:migrate
	```
	To undo migration:
	```
	% npx sequelize db:migrate:undo:all(if you want to remove all migrations)
	```
6. Edit the seed files with dummy data for testing. When ready, run the following commands to seed the database:
	```
	% npx sequelize db:seed:all
	```
	Undo:
	```
	% npx sequelize db:seed:undo:all
	```




## Running Server
1. Start the server
    ```
    % cd server
    % npm start
    ```
2. Server should now correctly run and update when you make changes to the files! You can check the various endpoints to see what gets returned at [localhost:8000](http://localhost:8000)
3. You can run the test cases for the server by running
    ```
    % npm test
    ```

## Running Client
1. Start the client
    ```
    % cd client
    % npm start
    ```
2. Open browser at [localhost:3000](http://localhost:3000)
3. You can run the test cases for the client by running
    ```
    % npm test
    ```


## Setting Up the Database
*[WIP]*


## General Structure
The `server` folder contains our Node.js based server, which is run on Express and uses Sequelize to interact with the database. This handles all of the Model and Controller components of our MVC application.

The `client` folder contains our React.js based client. This handles all of the View component of our MVC application.

The general flow of data is (excuse the incorrect terminology):
- User accesses client website and visits an endpoint (i.e. [localhost:3000/admin]())
- In order to render the page correctly, we make a request to the server (i.e. [localhost:8000/admin])
- The server may grab stuff from the database, or data stored in the application itself and returns it
- The frontend generates the page render using the data it gets from the server and returns to the browser
- The browser renders the web page

## General Server File Structure
This is the folder structure for the Node.js server (inside of the `server` folder).

`app.js` - Entrypoint for the application, this is where all the setup happens

| Folder        | Description |
| ------------  | ----------- |
| `config`      | Can ignore, just used for setting up database |
| `controllers` | Used to store controllers for our web application, basically where most of the logic takes place |
| `models`      | Used to store all the schema for our various database models |
| `public`      | Used to hold any static files for the webpage (css, js, images, files, etc) |
| `routes`      | Used to route endpoint (i.e. tells you where `/admin` is supposed to go to). Note: A lot of resources say to combine this with controllers, we might end up consolidating but started off with this separated |
| `tests`       | Used to write unit tests (which are currently using the [Jest](https://jestjs.io/docs/getting-started) framework) |

## General Client File Structure
This is the folder structure for the React.js client application (inside of the `client` folder).
*[This needs to be filled out more... I don't know React very well, will need to do more research lol]*

`public` - General static files served to the webpage
`src` - Where all the pages and components are built

Inside of the `src` folder:

| Folder        | Description |
| ------------  | ----------- |
| `App.js`      | Entry point for the client application, handles routing to the right page |
| `components`  | Used to create reusable/large components in the various web pages |
| `pages`       | Stored the base components for each of the pages |
| `tests`       | Used to write unit tests (which are currently using the [Jest](https://jestjs.io/docs/getting-started) framework) |

### Current Routes
| Page          | Path        | Example                   |
| ------------- | ----------- | ------------------------- |
| Home Page     | `/`         | `localhost:8000/`         |
| Settings Page | `/settings` | `localhost:8000/settings` |
| Admin Page    | `/admin`    | `localhost:8000/admin`    |

## Configuration
### Server-Side
The following fields must be added to the `server/config/config.json` file:
| Name          | Description        | Link   | Point of Contact for Help |
| ------------- | ------------------ | ------ | ------------------------- |
| slack-webhook | URL to your incoming Slack webhook | https://my.slack.com/services/new/incoming-webhook/ | Angela |

Add them to the end of the file like so:
```
{    
    ...,
    "name": "value",
    "name": "value"
}
```
