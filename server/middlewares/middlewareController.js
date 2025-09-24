import jwt from "jsonwebtoken";

const middlewareController = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const t = jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid token");
        req.user = user;
        next();
      });
    } else {
      res.status(401).send("Access denied");
    }
  },
};
export default middlewareController;
