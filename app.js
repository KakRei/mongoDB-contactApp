const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const port = 3000;
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const { Contact } = require("./model/contact");
const methodOverride = require("method-override");
const { body, validationResult } = require("express-validator");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

//Connect to database
dotenv.config();
connectDB();

// Middleware to override methods for forms
app.use(methodOverride("_method"));

// Set up EJS as the templating engine
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Middleware for session management and flash messages
app.use(cookieParser("secret"));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000 },
  })
);
app.use(flash());

app.get("/", (req, res) => {
  res.render("index", { title: "My Express App", layout: "layouts/main" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About Us", layout: "layouts/main" });
});

app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    title: "Contacts",
    layout: "layouts/main",
    contacts,
    msg: req.flash("msg"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Add Contact",
    layout: "layouts/main",
    errors: [],
    data: {},
  });
});

app.post(
  "/contact",
  [
    body("nama").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("nohp")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Add Contact",
        layout: "layouts/main",
        errors: errors.array(),
        data: req.body,
      });
    } else {
      Contact.create(req.body);
      req.flash("msg", "Contact added successfully!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/:id", async (req, res) => {
  const id = req.params.id;
  const contact = await Contact.findById(id);

  res.render("detail", {
    title: "Contact Detail",
    layout: "layouts/main",
    contact,
  });
});

app.delete("/contact/:id", async (req, res) => {
  const id = req.params.id;
  await Contact.findByIdAndDelete(id);

  req.flash("msg", "Contact deleted successfully");
  res.redirect("/contact");
});

app.get("/contact/edit/:id", async (req, res) => {
  const id = req.params.id;
  const contact = await Contact.findById(id);

  res.render("edit-contact", {
    title: "Edit Contact",
    layout: "layouts/main",
    errors: [],
    contact,
  });
});

app.put(
  "/contact",
  [
    body("nama").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("nohp")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Edit Contact",
        layout: "layouts/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      await Contact.findByIdAndUpdate(req.body._id, req.body);
      req.flash("msg", "Contact updated successfully!");
      res.redirect("/contact");
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
