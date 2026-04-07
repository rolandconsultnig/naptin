const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Op } = require('sequelize');
const { auth, authorize } = require('../middleware/auth');
const Document = require('../models/Document');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/documents');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'));
    }
  }
});

// Get documents with filters
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      documentType, 
      employeeId, 
      departmentId, 
      isConfidential,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { isActive: true };

    // Apply filters
    if (documentType) whereClause.documentType = documentType;
    if (employeeId) whereClause.employeeId = employeeId;
    if (departmentId) whereClause.departmentId = departmentId;
    if (isConfidential !== undefined) whereClause.isConfidential = isConfidential === 'true';
    
    // Search in title and description
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Check access permissions
    if (req.user.role !== 'Admin' && req.user.role !== 'HR Manager') {
      whereClause.accessLevel = {
        [Op.in]: ['PUBLIC', 'DEPARTMENT']
      };
    }

    const documents = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: documents.rows,
      pagination: {
        total: documents.count,
        page: parseInt(page),
        pages: Math.ceil(documents.count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload document
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      employeeId,
      departmentId,
      documentType,
      title,
      description,
      isConfidential = false,
      accessLevel = 'DEPARTMENT',
      expirationDate,
      tags
    } = req.body;

    // Validate required fields
    if (!documentType || !title) {
      return res.status(400).json({ error: 'Document type and title are required' });
    }

    const document = await Document.create({
      employeeId: employeeId || null,
      departmentId: departmentId || null,
      documentType,
      title,
      description,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
      isConfidential: isConfidential === 'true',
      accessLevel,
      expirationDate: expirationDate || null,
      tags: tags ? JSON.stringify(tags.split(',')) : null,
      version: '1.0',
      metadata: JSON.stringify({
        uploadedAt: new Date(),
        originalName: req.file.originalname
      })
    });

    const documentWithRelations = await Document.findByPk(document.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: documentWithRelations,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download document
router.get('/download/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permissions
    if (document.isConfidential && 
        req.user.role !== 'Admin' && 
        req.user.role !== 'HR Manager' && 
        document.uploadedBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    try {
      await fs.access(document.filePath);
    } catch (err) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Document,
          as: 'versions',
          attributes: ['id', 'version', 'createdAt']
        }
      ]
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permissions
    if (document.isConfidential && 
        req.user.role !== 'Admin' && 
        req.user.role !== 'HR Manager' && 
        document.uploadedBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update document metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      documentType,
      accessLevel,
      isConfidential,
      expirationDate,
      tags
    } = req.body;

    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && 
        req.user.role !== 'HR Manager' && 
        document.uploadedBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await document.update({
      title: title || document.title,
      description: description || document.description,
      documentType: documentType || document.documentType,
      accessLevel: accessLevel || document.accessLevel,
      isConfidential: isConfidential !== undefined ? isConfidential : document.isConfidential,
      expirationDate: expirationDate || document.expirationDate,
      tags: tags ? JSON.stringify(tags.split(',')) : document.tags
    });

    const updatedDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedDocument,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete document
router.delete('/:id', auth, authorize(['HR Manager', 'Admin']), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Soft delete
    await document.update({ isActive: false });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get document types
router.get('/types/list', auth, (req, res) => {
  const documentTypes = [
    'CONTRACT',
    'CERTIFICATION',
    'POLICY',
    'HANDBOOK',
    'ONBOARDING',
    'PERFORMANCE_REVIEW',
    'DISCIPLINARY',
    'TRAINING_CERTIFICATE',
    'ID_DOCUMENT',
    'TAX_DOCUMENT',
    'BENEFIT_DOCUMENT',
    'OTHER'
  ];

  res.json({
    success: true,
    data: documentTypes
  });
});

// Get expiring documents
router.get('/expiring/soon', auth, authorize(['HR Manager', 'Admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(days));

    const expiringDocs = await Document.findAll({
      where: {
        isActive: true,
        expirationDate: {
          [Op.lte]: expirationDate,
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['expirationDate', 'ASC']]
    });

    res.json({
      success: true,
      data: expiringDocs
    });
  } catch (error) {
    console.error('Error fetching expiring documents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
