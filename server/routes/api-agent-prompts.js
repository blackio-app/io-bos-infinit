/**
 * IO BOS Divine Operating System - API Routes for Agent Prompts
 * 
 * This module provides secure API endpoints for accessing agent prompts.
 * It implements authentication and authorization to protect prompt data.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'io-bos-divine-secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

// Get all agent prompts (protected)
router.get('/agent-prompts', authenticateToken, (req, res) => {
  try {
    const promptsPath = path.join(__dirname, '../../css/js/public/agents/agent-prompts.json');
    const promptsData = fs.readFileSync(promptsPath, 'utf8');
    const prompts = JSON.parse(promptsData);
    
    res.json(prompts);
  } catch (error) {
    console.error('Error reading agent prompts:', error);
    res.status(500).json({ error: 'Failed to retrieve agent prompts.' });
  }
});

// Get specific agent prompt (protected)
router.get('/agent-prompts/:agentName', authenticateToken, (req, res) => {
  try {
    const { agentName } = req.params;
    const promptsPath = path.join(__dirname, '../../css/js/public/agents/agent-prompts.json');
    const promptsData = fs.readFileSync(promptsPath, 'utf8');
    const prompts = JSON.parse(promptsData);
    
    if (!prompts[agentName]) {
      return res.status(404).json({ error: `Agent "${agentName}" not found.` });
    }
    
    res.json(prompts[agentName]);
  } catch (error) {
    console.error(`Error reading agent prompt for ${req.params.agentName}:`, error);
    res.status(500).json({ error: 'Failed to retrieve agent prompt.' });
  }
});

// Update agent prompt (protected, admin only)
router.put('/agent-prompts/:agentName', authenticateToken, (req, res) => {
  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  try {
    const { agentName } = req.params;
    const promptsPath = path.join(__dirname, '../../css/js/public/agents/agent-prompts.json');
    const promptsData = fs.readFileSync(promptsPath, 'utf8');
    const prompts = JSON.parse(promptsData);
    
    if (!prompts[agentName]) {
      return res.status(404).json({ error: `Agent "${agentName}" not found.` });
    }
    
    // Update prompt data
    prompts[agentName] = {
      ...prompts[agentName],
      ...req.body
    };
    
    // Write updated prompts back to file
    fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2), 'utf8');
    
    res.json({ message: `Agent "${agentName}" prompt updated successfully.` });
  } catch (error) {
    console.error(`Error updating agent prompt for ${req.params.agentName}:`, error);
    res.status(500).json({ error: 'Failed to update agent prompt.' });
  }
});

module.exports = router;
