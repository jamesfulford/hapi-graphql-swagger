const hapi = require('hapi');
const mongoose = require('mongoose');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const schema = require('./graphql/schema');
const Painting = require('./models/Paintings');

mongoose.connect(require('./credentials').mongodb.connection, { useNewUrlParser: true });

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
    await server.register({
        name: 'GraphIQL',
        plugin: graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql',
            },
            route: {
                cors: true,
            },
        },
        register: () => {},
    });
    await server.register({
        name: 'GraphQL',
        plugin: graphqlHapi,
        options: {
            path: '/graphql',
            graphqlOptions: {
                schema,
            },
            route: {
                cors: true,
            },
        },
        register: () => { },
    });
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Paintings API Documentation',
                    version: Pack.version,
                },
            },
        },
    ]);

    server.route([
        {
            method: 'GET',
            path: paintingUrl,
            handler: (req, res) => Painting.find(),
            config: {
                description: 'Get all the paintings',
                tags: ['api', 'painting'],
            },
        },
        {
            method: 'POST',
            path: paintingUrl,
            handler: (req, res) => {
                const { name, url, technique } = req.payload;
                const painting = new Painting({
                    name,
                    url,
                    technique,
                });
                return painting.save();
            },
            config: {
                description: 'Add a painting',
                tags: ['api', 'painting'],
            },
        },
    ]);


    await server.start();
    console.log(`Server running at ${server.info.uri}`);
}

init();
