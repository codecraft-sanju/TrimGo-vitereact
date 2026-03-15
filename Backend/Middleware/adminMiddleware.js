import jwt from "jsonwebtoken";

export const protectAdmin = (req, res, next) => {
  let token;

  // Frontend se token "Authorization: Bearer <token>" format mein aayega
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Not authorized as Admin, no token" 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "kldklkfjdfjfdlkjdlfjdlfjkldfjldkfdjfdfjdfjdfdjfdjfl";
    
    // Token verify karein
    const decoded = jwt.verify(token, secret);

    // Check karein ki token mein role "admin" hai ya nahi
    if (decoded.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized, Admin only" 
      });
    }

    next();
  } catch (err) {
    console.error("Admin Auth middleware error:", err.message);
    return res.status(401).json({ 
      success: false, 
      message: "Not authorized as Admin, token failed" 
    });
  }
};