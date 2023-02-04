import express from 'express';
const route = express.Router();

route.get('/', (req: express.Request, res: express.Response) => {
    res.send({ message: "hello world" });
});

export default route;