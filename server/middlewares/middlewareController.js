import jwt from "jsonwebtoken";

const middlewareController = {
  verifyToken: (req, res, next) => {
    
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key_here_sportify_store_2025";
      
      
      jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
          return res.status(403).json({ 
            success: false, 
            message: "Invalid token", 
            error: err.message 
          });
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "Access denied: Authorization header missing" 
      });
    }
  },
};
export default middlewareController;
