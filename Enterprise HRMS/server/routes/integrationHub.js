const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const IntegrationHub = require('../models/IntegrationHub');
const User = require('../models/User');

// Get all integration hub data
router.get('/', auth, async (req, res) => {
  try {
    const integrations = await IntegrationHub.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics
    const totalIntegrations = integrations.length;
    const activeIntegrations = integrations.filter(i => i.status === 'active').length;
    const erpIntegrations = integrations.filter(i => i.type === 'erp').length;
    const crmIntegrations = integrations.filter(i => i.type === 'crm').length;
    const apiIntegrations = integrations.filter(i => i.type === 'api').length;
    const customWorkflows = integrations.filter(i => i.type === 'workflow').length;

    res.json({
      integrations,
      stats: {
        totalIntegrations,
        activeIntegrations,
        erpIntegrations,
        crmIntegrations,
        apiIntegrations,
        customWorkflows
      }
    });
  } catch (error) {
    console.error('Get integration hub data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ERP integrations
router.get('/erp', auth, async (req, res) => {
  try {
    const erpIntegrations = await IntegrationHub.findAll({
      where: { type: 'erp' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(erpIntegrations);
  } catch (error) {
    console.error('Get ERP integrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get CRM integrations
router.get('/crm', auth, async (req, res) => {
  try {
    const crmIntegrations = await IntegrationHub.findAll({
      where: { type: 'crm' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(crmIntegrations);
  } catch (error) {
    console.error('Get CRM integrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get API marketplace
router.get('/api-marketplace', auth, async (req, res) => {
  try {
    const apiIntegrations = await IntegrationHub.findAll({
      where: { type: 'api' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(apiIntegrations);
  } catch (error) {
    console.error('Get API marketplace error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get custom workflows
router.get('/workflows', auth, async (req, res) => {
  try {
    const workflows = await IntegrationHub.findAll({
      where: { type: 'workflow' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(workflows);
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get IT system sync
router.get('/it-sync', auth, async (req, res) => {
  try {
    const itSyncs = await IntegrationHub.findAll({
      where: { type: 'it_sync' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(itSyncs);
  } catch (error) {
    console.error('Get IT sync error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get third-party integrations
router.get('/third-party', auth, async (req, res) => {
  try {
    const thirdPartyIntegrations = await IntegrationHub.findAll({
      where: { type: 'third_party' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(thirdPartyIntegrations);
  } catch (error) {
    console.error('Get third-party integrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new ERP integration
router.post('/erp', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      erpSystem, 
      connectionDetails, 
      syncFrequency 
    } = req.body;
    
    const erpIntegration = await IntegrationHub.create({
      employeeId,
      type: 'erp',
      title: `${erpSystem} Integration`,
      description: `ERP system integration with ${erpSystem}`,
      erpSystem,
      connectionDetails: JSON.stringify(connectionDetails),
      syncFrequency: syncFrequency || 'daily',
      status: 'active'
    });

    res.status(201).json(erpIntegration);
  } catch (error) {
    console.error('Create ERP integration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new CRM integration
router.post('/crm', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      crmSystem, 
      connectionDetails, 
      syncFrequency 
    } = req.body;
    
    const crmIntegration = await IntegrationHub.create({
      employeeId,
      type: 'crm',
      title: `${crmSystem} Integration`,
      description: `CRM system integration with ${crmSystem}`,
      crmSystem,
      connectionDetails: JSON.stringify(connectionDetails),
      syncFrequency: syncFrequency || 'daily',
      status: 'active'
    });

    res.status(201).json(crmIntegration);
  } catch (error) {
    console.error('Create CRM integration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new API integration
router.post('/api', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      apiName, 
      apiEndpoint, 
      apiKey, 
      rateLimit 
    } = req.body;
    
    const apiIntegration = await IntegrationHub.create({
      employeeId,
      type: 'api',
      title: `${apiName} API`,
      description: `API integration with ${apiName}`,
      apiName,
      apiEndpoint,
      apiKey,
      rateLimit: rateLimit || 1000,
      status: 'active'
    });

    res.status(201).json(apiIntegration);
  } catch (error) {
    console.error('Create API integration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create custom workflow
router.post('/workflows', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      workflowName, 
      workflowSteps, 
      triggers 
    } = req.body;
    
    const workflow = await IntegrationHub.create({
      employeeId,
      type: 'workflow',
      title: workflowName,
      description: `Custom workflow: ${workflowName}`,
      workflowName,
      workflowSteps: JSON.stringify(workflowSteps),
      triggers: JSON.stringify(triggers),
      status: 'active'
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update integration status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lastSync, errorMessage } = req.body;
    
    const integration = await IntegrationHub.findByPk(id);
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    integration.status = status;
    if (lastSync) integration.lastSync = lastSync;
    if (errorMessage) integration.errorMessage = errorMessage;
    
    await integration.save();

    res.json(integration);
  } catch (error) {
    console.error('Update integration status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
