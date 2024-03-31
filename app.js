const express = require('express');
const app = express();
const dotenv = require('dotenv').config()
const dbConnect = require('./confiq/db.Connect');
const PORT = process.env.PORT || 9898;
const path = require('path');
const userRoutes = require('./router/userRoutes');
const adminRoutes = require('./router/adminRoutes')
dbConnect();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
// app.use('/public', express.static('public', { 
//     setHeaders: (res, path) => {
//       if (path.endsWith('.css')) {
//         res.setHeader('Content-Type', 'text/css');
//       }
//     }
//   }));
// app.use(express.staticm(path.join(__dirname, 'public')));

const session = require('express-session');
app.use(session({
  secret:'fvs',
  resave: false,
  saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.set('views', './views')






app.use('/',userRoutes);
app.use('/',adminRoutes)



app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
}).on('error', (err) => {
    console.error(`Error starting server: ${err.message}`);
});
