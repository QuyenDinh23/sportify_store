import jwt from "jsonwebtoken";

const middlewareController = {
  verifyToken: (req, res, next) => {
    console.log("=== MIDDLEWARE DEBUG ===");
    console.log("Authorization header:", req.headers["authorization"]);
    
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key_here_sportify_store_2025";
      
      console.log("Token:", token ? "Token exists" : "No token");
      
      jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
          console.error("JWT Verification Error:", err.message);
          return res.status(403).json({ 
            success: false, 
            message: "Invalid token", 
            error: err.message 
          });
        }
        console.log("JWT verified successfully, user:", user);
        req.user = user;
        next();
      });
    } else {
      console.log("No authorization header");
      res.status(401).json({ 
        success: false, 
        message: "Access denied: Authorization header missing" 
      });
    }
  },
};
export default middlewareController;
