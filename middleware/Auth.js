const requireAuth = (req, res, next) => {
    if (req.session && req.session.token) {
        // User is logged in, allow access to the route
        next();
    } else {
        // User is not logged in, redirect to login page or send error response
        res.status(401).json({ message: 'Unauthorized' });
    }
};
