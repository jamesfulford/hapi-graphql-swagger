const hapi = require('hapi');
const mongoose = require('mongoose');

const Painting = require('./models/Paintings');

const { mongodb } = require('./credentials');

mongoose.connect(mongodb.connection, { useNewUrlParser: true });

mongoose.connection.once('open', () => {
    console.log('Connected to database.');
});

const server = hapi.server({
    port: 4000,
    host: 'localhost',
});

const baseRoute = '/api';
const paintingUrl = `${baseRoute}/paintings`;

const init = async () => {
    server.route([
        { method: 'GET', path: paintingUrl, handler: (req, res) => Painting.find() },
        {
            method: 'POST',
            path: paintingUrl,
            handler: (req, res) => {
                const { name, url, techniques } = req.payload;
                const painting = new Painting({
                    name,
                    url,
                    techniques,
                });
                return painting.save();
            },
        },
    ]);
    await server.start();
    console.log(`Server running at ${server.info.uri}`);
}

init();
