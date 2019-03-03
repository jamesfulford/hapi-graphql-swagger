const hapi = require('hapi');
const mongoose = require('mongoose');

const { mongodb } = require('./credentials');

mongoose.connect(mongodb.connection, { useNewUrlParser: true });

mongoose.connection.once('open', () => {
    console.log('Connected to database.');
});

const server = hapi.server({
    port: 4000,
    host: 'localhost',
});

const init = async () => {
    server.route({
        method: 'GET',
        path: '/',
        handler: (req, rep) => `<h1>Hello World</h1>`,
    });
    await server.start();
    console.log(`Server running at ${server.info.uri}`);
}

init();
