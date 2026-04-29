const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', clientId = '' } = req.query;
    
    const query = { userId: req.user.userId };

    if (clientId) {
      query.clientId = clientId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('clientId', 'name email company')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };

    return successResponse(res, projects, 'Projects fetched successfully', 200, pagination);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, clientId, status, startDate, endDate } = req.body;

    if (!name || !clientId) {
      return errorResponse(res, 'BAD_REQUEST', 'Project name and Client are required', 400);
    }

    const projectData = {
      name,
      description,
      clientId,
      userId: req.user.userId,
      status: status || 'active',
      startDate,
      endDate,
    };

    const project = await Project.create(projectData);
    return successResponse(res, project, 'Project created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.userId }).populate('clientId');
    if (!project) {
      return errorResponse(res, 'NOT_FOUND', 'Project not found', 404);
    }

    // Fetch invoices linked to this project
    const invoices = await Invoice.find({ projectId: req.params.id, userId: req.user.userId }).sort({ createdAt: -1 });

    return successResponse(res, { project, invoices }, 'Project details fetched');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return errorResponse(res, 'NOT_FOUND', 'Project not found', 404);
    }

    return successResponse(res, project, 'Project updated successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
};
