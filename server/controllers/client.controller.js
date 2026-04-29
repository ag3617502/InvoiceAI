const mongoose = require('mongoose');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tag = '', status = '' } = req.query;

    const query = {
      userId: req.user.userId,
      $and: []
    };

    if (status) {
      if (status === 'active') {
        query.$and.push({ $or: [{ status: 'active' }, { status: { $exists: false } }] });
      } else {
        query.$and.push({ status: status });
      }
    }

    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ]
      });
    }

    if (tag) {
      query.$and.push({ tags: tag });
    }

    if (query.$and.length === 0) {
      delete query.$and;
    }

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };

    return successResponse(res, clients, 'Clients fetched successfully', 200, pagination);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const createClient = async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      userId: req.user.userId,
    };

    const client = await Client.create(clientData);
    return successResponse(res, client, 'Client created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!client) {
      return errorResponse(res, 'NOT_FOUND', 'Client not found', 404);
    }

    // Aggregate stats
    const stats = await Invoice.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(req.params.id),
          userId: new mongoose.Types.ObjectId(req.user.userId),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);

    const clientObj = client.toObject();
    clientObj.stats = stats;

    return successResponse(res, clientObj);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return errorResponse(res, 'NOT_FOUND', 'Client not found', 404);
    }

    return successResponse(res, client, 'Client updated successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const deleteClient = async (req, res) => {
  try {
    // Soft delete
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return errorResponse(res, 'NOT_FOUND', 'Client not found', 404);
    }

    return successResponse(res, null, 'Client deleted successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

module.exports = {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
};
