const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session'); 
const nocache = require('nocache');
const path = require('path');
const otpGenerator = require('otp-generator');
const morgan = require('morgan');
const userRoute = require('./routes/userRoutes');
const adminroute = require('./routes/adminRoutes');
require('dotenv').config();




app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(nocache());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'asdfghjkloiuyyjdsh',
    resave: false,
    saveUninitialized: true,
  })
);





app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
      return next(err);
  }
  if (err.status === 404) {
      return res.status(404).render('error');
  }
  res.status(err.status || 500).render('error', { error: err.message });
});




app.use(express.static(path.join(__dirname, './admin')));
app.use(express.static(path.join(__dirname, './public')));


app.use('/', userRoute);
app.use('/admin', adminroute);

mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('DB Connected');
    app.listen(3000, () => {
      console.log('App is running');
    });
  })
  .catch((err) => console.error('Error connecting to the database:', err));

