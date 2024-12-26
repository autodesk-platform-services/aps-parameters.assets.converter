const express = require('express');
const session = require('cookie-session');
const { PORT, SERVER_SESSION_SECRET } = require('./config.js');

let app = express();
app.use(express.static('wwwroot'));
app.use(session({ secret: SERVER_SESSION_SECRET, maxAge: 24 * 60 * 60 * 1000 }));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/hubs', require('./routes/hubs.js'));
app.use('/api/accounts', require('./routes/parameters.js'));
app.use('/api/assets', require('./routes/assets.js'));
app.use((err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 502;
    res.status(statusCode).json(err);
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
