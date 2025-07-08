import jsonServer from 'json-server';
import auth from 'json-server-auth';
import config from './auth-config.js'; // phải là .js (có đuôi đầy đủ!)

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

auth.config = config;
server.db = router.db;

server.use(middlewares);
server.use(auth);
server.use(router);

server.listen(9999, () => {
    console.log('🚀 JSON Server Auth running at http://localhost:9999');
});
