# 122q

On the come up B)
**The Squad:** Pranav Addepalli, Angela Zhang, Amanda Li, Bhargav Hadya, Brandon Sommerfeld, Esther Cao, Jackson Romero, Lora Zhou, Mengrou Shou

## Getting Started
1. Install [Node.js](https://nodejs.org/en/)
2. Install Node modules
    ```% npm install```
3. Install [MySQL](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/)

## Running Server
1. Start the server
    ```% npm start```
2. Open browser at [localhost:8000](http://localhost:8000)

## Creating the Database
*[WIP]*

## General File Structure
`app.js` - Entrypoint for the application, this is where all the setup happens

| Folder        | Description |
| ------------  | ----------- |
| `config`      | Can ignore, just used for setting up database |
| `controllers` | Used to store controllers for our web application, basically where most of the logic takes place |
| `models`      | Used to store all the schema for our various database models |
| `public`      | Used to hold any static files for the webpage (css, js, images, files, etc) |
| `routes`      | Used to route endpoint (i.e. tells you where `/admin` is supposed to go to). Note: A lot of resources say to combine this with controllers, we might end up consolidating but started off with this separated |
| `tests`       | Used to write unit tests (which are currently using the [Jest](https://jestjs.io/docs/getting-started) framework) |
| `views`       | Folder where all the views live. Currently using `.ejs` (templated HTML) to create the various views, can swap to other options supported by Node.js |

### Current Routes:
| Page          | Path        | Example                   |
| ------------- | ----------- | ------------------------- |
| Home Page     | `/`         | `localhost:8000/`         |
| Settings Page | `/settings` | `localhost:8000/settings` |
| Admin Page    | `/admin`    | `localhost:8000/admin`    |
