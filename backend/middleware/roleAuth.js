const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.userRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please login first.",
        });
      }

      if (!allowedRoles.includes(req.userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. You do not have permission to perform this action.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization.",
      });
    }
  };
};

export default roleAuth;
