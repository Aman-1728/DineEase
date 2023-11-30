// require('dotenv').config()
// const express = require('express');
// const app = express();
// const ejs = require('ejs');
// const path = require('path');
// const expressLayout = require('express-ejs-layouts');
// const PORT = process.env.PORT || 3300;
// const mongoose = require('mongoose');
// const session=require('express-session')
// const passport = require('passport')
// const MongoDbstore =require('connect-mongo')
// const flash = require('express-flash')
// const Emitter = require('events')

// // Database connection
// const url = 'mongodb://localhost/pizza';
// mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
// const connection = mongoose.connection;

// connection.on('error', err => {
//     console.error('Connection error:', err);
// });

// connection.once('open', () => {
//     console.log('Database connected...');
//     app.listen(PORT, () => {
//         console.log(`Listening on port ${PORT}`);
//     });
// });

// // Event emitter 
// const eventEmitter = new Emitter()
// app.set('eventEmitter', eventEmitter)

// app.use(session({
//     secret:process.env.COOKIE_SECRET,
//     resave: false, 
//     store: MongoDbstore.create({
//         mongoUrl:url
//     }),
//     saveUninitialized: false, 
//     cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour 
// }))

// // Passport config 
// const passportInit = require('./app/config/passport')
// passportInit(passport)
// app.use(passport.initialize())
// app.use(passport.session())


// app.use(flash())

// app.use(express.static('public'));
// app.use(express.urlencoded({extended:false}))
// app.use(express.json())

// // Global middleware 
// app.use((req, res, next) => {
//     res.locals.session = req.session
//     res.locals.user = req.user
//     next()
// })
// app.use(expressLayout);
// app.set('views', path.join(__dirname, '/resources/views'));
// app.set('view engine', 'ejs');

// require('./routes/web')(app);

// // app.listen(PORT , () => {
// //     console.log(`Listening on port ${PORT}`)
// // })

// // Socket 

// const io = require('socket.io')(server)
// io.on('connection', (socket) => {
//       // Join  
//       socket.on('join', (orderId) => {
//         socket.join(orderId)
//       })
// })

// eventEmitter.on('orderUpdated', (data) => {
//     io.to(`order_${data.id}`).emit('orderUpdated', data)
// })

// eventEmitter.on('orderPlaced', (data) => {
//     io.to('adminRoom').emit('orderPlaced', data)
// })

require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3300;
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoDbStore = require('connect-mongo');
const flash = require('express-flash');
const Emitter = require('events');
const http = require('http'); // Import the 'http' module
const server = http.createServer(app); // Create an HTTP server using Express

// Database connection
const url = 'mongodb://localhost/pizza';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.on('error', (err) => {
    console.error('Connection error:', err);
});

connection.once('open', () => {
    console.log('Database connected...');
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({
        mongoUrl: url,
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
}));

// Passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
});
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);

// Socket.io
const io = require('socket.io')(server); // Pass the server to Socket.io

io.on('connection', (socket) => {
    // Join
    socket.on('join', (orderId) => {
        socket.join(orderId);
    });
});

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data);
});

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data);
});
