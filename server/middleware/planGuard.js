const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

const requirePlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return errorResponse(res, 'UNAUTHORIZED', 'User not found', 401);
      }
      
      const userPlan = user.plan || 'free';

      const planHierarchy = ['free', 'starter', 'pro', 'agency'];
      const userPlanIndex = planHierarchy.indexOf(userPlan);
      const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

      if (userPlanIndex < requiredPlanIndex) {
        return errorResponse(
          res,
          'PLAN_UPGRADE_REQUIRED',
          `This feature requires a ${requiredPlan} plan or higher.`,
          403,
          { requiredPlan }
        );
      }

      next();
    } catch (error) {
      return errorResponse(res, 'SERVER_ERROR', error.message, 500);
    }
  };
};

module.exports = requirePlan;
