const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createConnection = mysql.createConnection({
  user: "myDBuser",
  password: "",
  host: "localhost",
  database: "mydb",
});

createConnection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

app.get("/", (req, res) => {
  res.end('Say, "HI!"');
});

app.get("/install", (req, res) => {
  const products = `CREATE TABLE if not exists Products(
        product_id int auto_increment,
        product_url varchar(255) not null,
        product_name varchar(255) not null,
        PRIMARY KEY (product_id)
    )`;

  const productDescription = `CREATE TABLE if not exists ProductsDescription(
        description_id int auto_increment,
        product_id int not null,
        product_brief_description varchar(255) not null,
        product_description TEXT not null,
        product_img varchar(255) not null,
        product_link varchar(255) not null,
        PRIMARY KEY (description_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )`;

  const productPrice = `CREATE TABLE if not exists ProductsPrice(
        price_id int auto_increment, 
        product_id int not null,
        starting_price varchar(255) not null,
        product_range varchar(255) not null,
        PRIMARY KEY (price_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )`;
  const user = `CREATE TABLE if not exists User(
    user_id int auto_increment,
    user_name varchar(255),
    user_password varchar(255),
    PRIMARY KEY (user_id)
  )`;

  const order = `CREATE TABLE if not exists Orders (
    order_id int auto_increment,
    product_id int not null,
    user_id int not null,
    PRIMARY KEY (order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
  )`;

  createConnection.query(products, (err, result, field) => {
    if (err) throw err;
  });

  createConnection.query(productDescription, (err, result, field) => {
    if (err) throw err;
  });

  createConnection.query(productPrice, (err, result, field) => {
    if (err) throw err;
  });

  createConnection.query(user, (err, result, field) => {
    if (err) throw err;
  });

  createConnection.query(order, (err, result, field) => {
    if (err) throw err;
  });
  res.end("Table Created!");
});

app.post("/add-product", (req, res) => {
  const result = req.body;

  const productValues = `INSERT INTO Products(product_url, product_name) VALUES (?, ?)`;

  const productDescriptionValue = `INSERT INTO ProductsDescription(product_id, product_brief_description, product_description, product_img, product_link) VALUES (?, ?, ?, ?, ?)`;

  const productPriceValue = `INSERT INTO ProductsPrice(product_id, starting_price, product_range) VALUES (?, ?, ?)`;

  createConnection.query(
    productValues,
    [result.product_url, result.product_name],
    (err, result, field) => {
      if (err) throw err;
      const results = req.body;
      const id = result.insertId;

      createConnection.query(
        productDescriptionValue,
        [
          id,
          results.product_brief_description,
          results.product_description,
          results.product_img,
          results.product_link,
        ],
        (err, result, field) => {
          if (err) throw err;
        }
      );
    }
  );
  res.send(req.body);
});

app.post("/request-data", (req, res) => {
  const request = req.body;
  createConnection.query(`SELECT * FROM Products`, (err, result) => {
    const arr = [];
    for (const re of result) {
      if (re.product_name == request.product_name) {
        arr.push(re);
      }
    }
    const id = arr[0].product_id;
    const user = `INSERT INTO user(user_name, user_password) VALUES (?, ?)`;

    const order = `INSERT INTO orders(product_id, user_id) VALUES (?, ?)`;

    createConnection.query(
      user,
      [request.user_name, request.user_password],
      (err, result, field) => {
        if (err) throw err;

        createConnection.query(
          order,
          [id, result.insertId],
          (err, result, field) => {
            if (err) throw err;
          }
        );
      }
    );
  });
  res.send("Request Proceed...");
});
app.listen(5000, (err) => {
  if (err) throw err;
  console.log("http://localhost:5000");
});
