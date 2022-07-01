# 122q

On the come up B)
**The Squad:** Pranav Addepalli, Angela Zhang, Amanda Li, Bhargav Hadya, Brandon Sommerfeld, Esther Cao, Jackson Romero, Lora Zhou, Mengrou Shou

## Getting Started
1. Download and install [Node.js](https://nodejs.org/en/)
2. Install Node modules within both `client` and `server` folders. `cd` into each and run:
    ```
    % npm install
    ```
3. Download and install [PostgreSQL](https://www.postgresql.org/download/) and set up the database ([see below](#setting-up-the-database))
4. Set up environment files ([see below](#configuration))

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
The server currently uses a PostgreSQL database. For the summer '22 development team, we're currently developing using a database hosted on Heroku - ping Pranav for details.

You can also set up a local database to test. Run the command below:
```
% createdb queue_db -U <db_user>
```
where `<db_user>` is the username you've set for PostgreSQL. You can then connect to this database by running:
```
% psql queue_db
```
and check the connection information by running:
```
% \conninfo
```
This should print out the following information:
> You are connected to database "queue_db" as user <db_user> via socket in <db_socket> at port <db_port>.


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
| `config`      | Used to store configuration settings to run the server - see below for details |
| `controllers` | Used to store controllers for our web application where most of the logic takes place |
| `models`      | Used to store all the schema for our various database models |
| `routes`      | Used to route endpoint (i.e. tells you where `/admin` is supposed to go to). Note: A lot of resources say to combine this with controllers, we might end up consolidating but started off with this separated |
| `tests`       | Used to write unit tests (which are currently using the [Jest](https://jestjs.io/docs/getting-started) framework) |

### Server-Side Routes
There are many of these routes, which can all be found in the `server/routes` folder.

## General Client File Structure
This is the folder structure for the React.js client application (inside of the `client` folder).
*[This needs to be filled out more... I don't know React very well, will need to do more research lol]*

`public` - General static files served to the webpage (icons, static images, manifests, etc.)
`src` - Where all the pages and components are built

Inside of the `src` folder:

| Folder           | Description |
| ---------------- | ----------- |
| `App.js`         | Entry point for the client application, handles routing to the right page |
| `http-common.js` | Configuring axios to contact the server (i.e. base URL, interceptors, etc) |
| `components`     | Used to create reusable/large components in the various web pages |
| `config`         | Used to store configuration settings to run the client |
| `pages`          | Stored the base components for each of the pages |
| `services`       | Used to keep axios services (used to interact with node server) |
| `themes`         | Used to create and store global themes (i.e. colors or fonts used on every page) |
| `tests`          | Used to write unit tests (which are currently using the [Jest](https://jestjs.io/docs/getting-started) framework) |

### Client-Side Routes
Each of these are configured in the main `client/src/App.js` file:
| Page          | Path        | Example                   |
| ------------- | ----------- | ------------------------- |
| Home Page     | `/`         | `localhost:8000/`         |
| Settings Page | `/settings` | `localhost:8000/settings` |
| Metrics Page  | `/metrics`  | `localhost:8000/metrics`  |

## Configuration
### Server-Side
The `server/config/config.js` file has all the fields required to configure the
server. Create a `.env` file with the following fields to set up the server:

| Name          | Description        | Link  | Point of Contact for Help |
| ------------- | ------------------ | -------------------- | ------------------------- |
| GOOGLE_CLIENT_ID | Google Client ID, used for Google OAuth | https://console.cloud.google.com/apis/credentials (Note: can not create project with Andrew email due to org permissions, need to use personal gmail) | Angela |
| GOOGLE_CLIENT_SECRET | Google Client Secret, used for Google OAuth | https://console.cloud.google.com/apis/credentials (Note: can not create project with Andrew email due to org permissions, need to use personal gmail) | Angela |
| SLACK_WEBHOOK_URL | URL to your incoming Slack webhook (note: will be deprecated once admin settings are set up) | https://my.slack.com/services/new/incoming-webhook/ | Angela |
| POSTGRESQL_DB | Name of the PostgreSQL database | Fill using values from [setting up the database](#setting-up-the-database) | Pranav |
| POSTGRESQL_DB_HOST | Name of the PostgreSQL database host | Fill using values from [setting up the database](#setting-up-the-database), only required if hosting the database elsewhere (i.e. on Heroku) | Pranav |
| POSTGRESQL_DB_USER | Username to access the PostgreSQL database | Fill using values from [setting up the database](#setting-up-the-database) | Pranav |
| POSTGRESQL_DB_PASSWORD | Password for the user to access the PostgreSQL database | Fill using values from [setting up the database](#setting-up-the-database) | Pranav |
| TOKEN_KEY | Key used to generate access tokens for users | Can use any random alphanumerical string | Bhargav |

Add them to the `.env` file like so:
```
{    
    ...,
    name=value,
    name=value,
}
```
