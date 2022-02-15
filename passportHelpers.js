const keys = require('./keys');
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log(token);
        jwt.verify(token, keys.secretOrKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = {
    authenticateJWT
}