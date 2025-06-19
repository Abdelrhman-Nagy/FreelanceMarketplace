// Authentication and authorization middleware

export const requireAuth = {
  assign: 'user',
  method: async (request, h) => {
    // In a real application, this would validate JWT tokens or session cookies
    // For this demo, we'll use a simple header-based authentication
    const userId = request.headers['x-user-id'];
    const userType = request.headers['x-user-type'];
    
    if (!userId || !userType) {
      throw h.response({
        error: 'Authentication required',
        message: 'Please log in to access this resource',
        status: 'error'
      }).code(401);
    }
    
    return {
      id: userId,
      userType: userType
    };
  }
};

export const requireRole = (allowedRoles) => ({
  assign: 'user',
  method: async (request, h) => {
    const user = await requireAuth.method(request, h);
    
    if (!allowedRoles.includes(user.userType)) {
      throw h.response({
        error: 'Insufficient permissions',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        status: 'error'
      }).code(403);
    }
    
    return user;
  }
});

export const requireClientRole = requireRole(['client']);
export const requireFreelancerRole = requireRole(['freelancer']);
export const requireOwnership = (resourceField = 'userId') => ({
  assign: 'user',
  method: async (request, h) => {
    const user = await requireAuth.method(request, h);
    const resourceUserId = request.payload?.[resourceField] || request.params?.[resourceField];
    
    if (user.id !== resourceUserId && user.userType !== 'admin') {
      throw h.response({
        error: 'Access denied',
        message: 'You can only access your own resources',
        status: 'error'
      }).code(403);
    }
    
    return user;
  }
});