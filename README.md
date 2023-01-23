
# Online-Voting-Platform

This is an online voting platform porject build using NodeJs,
Express for Backend and ejs and Tailwind CSS for front-end. Voter admins can
sign up and create new elections, add in questions, short description
and answer options to vote on. Admins can then register register voters
and launch the election where voters can login and vote.
Once election ends results are served on the public page of election.





## Demo

https://online-voting-platform-i9pc.onrender.com/
## Screenshots

![App Screenshot](https://imgur.com/cF3e4Wl.jpeg)  
![App Screenshot](https://imgur.com/jNbVUpm.jpeg)

## Run Locally

Clone the project

```bash
  git clone https://github.com/thedevildude/wd-online-voting.git
```

Go to the project directory

```bash
  cd wd-online-voting
```

Install dependencies

```bash
  npm install
```
Create the database

```bash
  npx sequelize-cli db:migrate
```

Start the server

```bash
  npm start
```


## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Deployment

To deploy this project run. (Make sure you have PostgreSQL installed)

```bash
  npm install
  npm run start:prod
```
Once the server has started please visit /sync route to sync the database


## Authors

- [@Devdeep](https://www.github.com/thedevildude)

