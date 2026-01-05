//filesystem nodemodule
// import filesystem module
// const fs = require("fs");

//writefile
// fs.writeFile("b.txt", "Hello", function (err) {
//   if (err) throw err;
//   console.log("done👍");
// });

//readfile
// fs.readFile("b.txt", "utf-8", function (err, data) {
//   if (err) throw err;
//   console.log(data + "😊");
// });

//renamefile
// fs.rename("b.txt", "vaish.txt", function (err) {
//   if (err) throw err;
//   //   console.log("renamed👍");
// });

//deletefile
// fs.unlink("vaish.txt", function (err) {
//   if (err) throw err;
// });

const express = require("express");
const cors = require("cors");
// const sendMail = require("./gmail");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");
require("dotenv").config();
dotenv.config();
const jwt = require("jsonwebtoken");

const { rateLimit } = require("express-rate-limit");
const nodemailer = require("nodemailer");
const helmet = require("helmet");

const app = express();
const port = process.env.PORT;
let secretkey = process.env.SECRETKEY;

//step1 -- require the package
const mongoose = require("mongoose");

//step2 -- establish a connection
// connection string
async function connection() {
  await mongoose.connect(process.env.MONGODB_URI);
}

//step3 -- create a schema
let productschema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

//step4 -- create a model(creating a table)
const productsmodel = mongoose.model("products", productschema);

// registration
let userschema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

//create model
const finalusers = mongoose.model("users", userschema);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

//middleware
app.use(cors());
app.use(limiter);
app.use(helmet());

// app.use((req, res, next) => {
//   console.log("logic verified👍");
//   next();
// });
app.use(express.json());

//products

// app.get("/products", (req, res) => {
//   res.json(products);
// });

//design an api
app.get("/", (req, res) => {
  res.json({
    data: ["hello world😊"],
  });
});

// app.get("/fact", (req, res) => {
//   res.json({
//     data: [
//       "The Eiffel Tower can be 15 cm taller during the summer, as the metal expands in the heat.",
//     ],
//   });
// });

// app.get("/hi", (req, res) => {
//   res.json({
//     data: ["Happy New Year!🎉"],
//   });
// });

//design an api where sellers send the product data now i will
// app.post("/products", (req, res) => {
//   const { id, title, price, image } = req.body;
//   const newproduct = { id, title, price, image };
//   products.push(newproduct);
//   res.json({
//     msg: "product added successfully",
//   });
// });

//design create an api to get products from db
app.post("/products", async (req, res) => {
  try {
    const { title, price, image } = req.body;
    await productsmodel.create({ title, price, image });
    res.status(201).json({ msg: "product added successfully" });

    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: "vaishnaviu1509@gmail.com",
      subject: "PRODUCT REGISTRATION",
      html: "A new product is added in our store",
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) throw error;
      console.log("products received  succesffully");
    });
  } catch (error) {
    res.json({
      msg: error.message,
    });
  }
});

app.get("/details", (req, res) => {
  let location = req.query.location;
  let age = req.query.age;
  let company = req.query.company;
  res.send(
    `this person is living in ${location} and his age is ${age} and he is working in ${company}`
  );
});

//api 3 -- fetch data from db and send these data to client
app.get("/products", async (req, res) => {
  try {
    let products = await productsmodel.find();
    res.json(products);
  } catch (error) {
    res.json({ msg: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  id = req.params.id;
  let singleproduct = await productsmodel.findById(id);
  res.json(singleproduct);
});

//api4 -- delete a product from db
app.delete("/products", async (req, res) => {
  try {
    let products = await productsmodel.findByIdAndDelete(
      "695772840ff5eaee046d72cc"
    );
    res.json({ msg: "products deleted successfully" });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

//api5 -- update a product from db
app.put("/products", async (req, res) => {
  try {
    let products = await productsmodel.findByIdAndUpdate(
      "695764bb6cc1c28210980a47",
      { title: "my chair", price: 20000 }
    );
    res.json({ msg: "products updated successfully" });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

//registration api
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    let users = await finalusers.findOne({ email });
    if (users) return res.json({ msg: "user already exists" });

    //hashing password
    let hashedpassword = await bcrypt.hash(password, 10);
    finalusers.create({ email, username, password: hashedpassword });
    // await sendMail(email, username);
    res.status(201).json({ msg: "user registered successfully" });

    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "ACCOUNT REGISTRATION",
      html: `Hi ${username} your account is created`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) throw error;
      console.log("email sent succesffully");
    });
  } catch (error) {
    res.json({
      msg: error.message,
    });
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let users = await finalusers.findOne({ email });
    if (!users) return res.json({ msg: "user not found" });
    let checkpassword = await bcrypt.compare(password, users.password);
    if (!checkpassword)
      return res.json({ msg: "email or password is incorrect" });

    //create a token
    let payload = { email: email };
    let token = await jwt.sign(payload, secretkey, { expiresIn: "1h" });

    res.json({ msg: "login successful", token: token });
  } catch (error) {
    res.json({
      msg: error.message,
    });
  }
});

//demo
// async function hashing(){
//   let passwords = "vaishnavi123";
//   let hashpassword = await bcrypt.hash(passwords, 10);
//   console.log(hashpassword);
// }

app.listen(port, async () => {
  console.log(`server is running on ${port}`);
  connection();
  console.log("db connected");
});

// await productsmodel.create({
//   title: "premium bag",
//   price: 20000,
//   image:
//     "https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696461/samples/ecommerce/leather-bag-gray.jpg",
// });

//multiple products

// await productsmodel.insertMany([
//   {
//     title: "chair",
//     price: 100000,
//     image:
//       "https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696469/samples/chair-and-coffee-table.jpg",
//   },
//   {
//     title: "watch",
//     price: 30000,
//     image:
//       "https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696459/samples/ecommerce/analog-classic.jpg",
//   },
// ]);

// await productsmodel.create([
//   {
//     title: "chair",
//     price: 200000,
//     image:
//       "https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696469/samples/chair-and-coffee-table.jpg",
//   },
// ]);

//fetch all products -- find()
// fetch only one product -- findOne()
// find  particular product -- findOne({ title: "chair" })

// find by id -- findById("6957638a45b27200468f0e89")
// let finalproducts = await productsmodel.findById("6957638a45b27200468f0e89");

//Delete by id -- findByIdAndDelete("6957638a45b27200468f0e89")
// let finalproducts = await productsmodel.findByIdAndDelete(
//   "6957638a45b27200468f0e89"
// );

//update by id -- findByIdAndUpdate("6957638a45b27200468f0e89", { price: 50000 })
//   let finalproducts = await productsmodel.findByIdAndUpdate(
//     "695764bb6cc1c28210980a47",
//     { title: "premium chair", price: 50000 }
//   );

//   console.log(finalproducts);

//  http://localhost:3000/
//  http://localhost:3000/fact
