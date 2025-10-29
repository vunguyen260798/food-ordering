// filepath: /Users/mac/Documents/src2/food-ordering/api/controllers/partnerController.js
const Partner = require('../models/Partner');

// @desc    Get all partners
// @route   GET /api/partners
// @access  Public
const getPartners = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Search by code or userName
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    const partners = await Partner.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: partners.length,
      data: partners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partners',
      error: error.message
    });
  }
};

// @desc    Get single partner
// @route   GET /api/partners/:id
// @access  Public
const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: partner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partner',
      error: error.message
    });
  }
};

// @desc    Create new partner
// @route   POST /api/partners
// @access  Private (Admin)
const createPartner = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: partner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating partner',
      error: error.message
    });
  }
};

// @desc    Update partner
// @route   PUT /api/partners/:id
// @access  Private (Admin)
const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Partner updated successfully',
      data: partner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating partner',
      error: error.message
    });
  }
};

// @desc    Delete partner
// @route   DELETE /api/partners/:id
// @access  Private (Admin)
const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting partner',
      error: error.message
    });
  }
};

module.exports = {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner
};
