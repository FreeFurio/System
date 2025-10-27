// ========================
// 1) IMPORTS & INITIALIZATION
// ========================

import FirebaseService from '../services/firebase.service.mjs';
import redisService from '../services/redis.service.mjs';
import { AppError } from '../utils/errorHandler.mjs';
import { io } from '../server.mjs';
import AIService from '../services/aiService.mjs';

// ========================
// 2) CONTROLLER FUNCTIONS
// ========================

// ========================
// 2.1) CREATING  TASK
// ========================

const createWorkflow = async (req, res, next) => {
    console.log('🔄 createWorkflow called with body:', req.body);
    try {
        const { objectives, gender, minAge, maxAge, deadline, numContent, selectedPlatforms } = req.body;
        const workflowData = { objectives, gender, minAge, maxAge, deadline, numContent, selectedPlatforms: selectedPlatforms || [] };
        
        if (!objectives || !gender || !minAge || !maxAge || !deadline) {
            return next(new AppError('All fields are required', 400));
        }
        
        const workflowId = await FirebaseService.createWorkflow(workflowData);
        
        // Create notification for Marketing Lead
        await FirebaseService.createMarketingNotification({
            type: 'task_created',
            message: `New task created: ${objectives}`,
            user: 'System'
        });
        
        const newWorkflow = {
            id: workflowId,
            ...workflowData,
            status: 'content_creation',
            currentStage: 'contentcreator'
        };
        
        // Invalidate Redis cache
        await redisService.del('workflows:all');
        
        // Broadcast to all connected clients
        io.emit('workflow:created', newWorkflow);

        res.status(200).json({
            status: 'success',
            message: 'Workflow created successfully',
            data: newWorkflow
        });
    } catch (error) {
        console.error('❌ createWorkflow - Error:', error);
        next(error);
    }
}

const setTaskGraphicDesigner = async (req, res, next) => {
    console.log('🎨 setTaskGraphicDesigner called with body:', req.body);
    try {
        const { objectives, gender, minAge, maxAge, deadline, numContent } = req.body;
        const task = { objectives, gender, minAge, maxAge, deadline, numContent };
        console.log('🎨 setTaskGraphicDesigner task object:', task);
        
        if (!objectives || !gender || !minAge || !maxAge || !deadline || !numContent) {
            console.log('❌ setTaskGraphicDesigner - Missing required fields');
            return next(new AppError('All fields are required', 400));
        }
        console.log('✅ setTaskGraphicDesigner - All required fields present');
        
        console.log('🎨 setTaskGraphicDesigner - Saving task to Firebase');
        const taskID = await FirebaseService.setTaskGraphicDesigner(task);
        console.log('✅ setTaskGraphicDesigner - Task saved with ID:', taskID);
        
        console.log('🎨 setTaskGraphicDesigner - Emitting Socket.IO event');
        io.emit('ongoingGraphicDesignerTask', {
            id: taskID,
            ...task
        });
        console.log('✅ setTaskGraphicDesigner - Socket.IO event emitted');

        console.log('🎉 setTaskGraphicDesigner - Task creation completed successfully');
        res.status(200).json({
            status: 'success',
            message: 'Graphic Designer task created successfully',
            data: {
                objectives,
                gender,
                minAge,
                maxAge,
                deadline,
                numContent
            }
        });
    } catch (error) {
        console.error('❌ setTaskGraphicDesigner - Error occurred:', error);
        next(error);
    }
}

// ========================
// 2.2) GET  TASK
// ========================

const getWorkflowsByStage = async (req, res, next) => {
    console.log('📋 getWorkflowsByStage called');
    try {
        const { stage } = req.params;
        const workflows = await FirebaseService.getWorkflowsByStage(stage);
        
        res.status(200).json({
            status: 'success',
            data: workflows
        });
    } catch (error) {
        console.error('❌ getWorkflowsByStage - Error:', error);
        next(error);
    }
}

const getTaskGraphicDesigner = async (req, res, next) => {
    console.log('🎨 getTaskGraphicDesigner called');
    try {
        console.log('🎨 getTaskGraphicDesigner - Fetching tasks from Firebase');
        const taskObj = await FirebaseService.getTaskGraphicDesigner();
        
        const task = taskObj
            ? Object.entries(taskObj).map(([key, value]) => ({ id: key, ...value }))
            : [];
        console.log('🎨 getTaskGraphicDesigner - Tasks processed:', task.length, 'tasks found');
        
        console.log('✅ getTaskGraphicDesigner - Tasks retrieved successfully');
        res.status(200).json({
            status: 'success',
            data: task
        })
    } catch (error) {
        console.error('❌ getTaskGraphicDesigner - Error occurred:', error);
        next(error);
    }
}

// ========================
// 3) EXPORTS
// ========================

const generateAIContent = async (req, res, next) => {
    console.log('🤖 generateAIContent called with body:', req.body);
    try {
        const { topic, numContents = 1, taskId, platforms } = req.body;
        
        if (!topic) {
            return next(new AppError('Topic is required', 400));
        }
        
        let targetPlatforms = platforms;
        
        // If taskId provided, get platforms from task configuration
        if (taskId && !platforms) {
            try {
                const workflow = await FirebaseService.getWorkflowById(taskId);
                if (workflow && workflow.selectedPlatforms && workflow.selectedPlatforms.length > 0) {
                    targetPlatforms = workflow.selectedPlatforms.map(p => p.name || p).filter(Boolean);
                    console.log(`🎯 Using platforms from task ${taskId}:`, targetPlatforms);
                } else {
                    targetPlatforms = ['facebook']; // Default fallback
                    console.log('⚠️ No platforms found in task, using Facebook as default');
                }
            } catch (error) {
                console.warn('⚠️ Could not fetch task platforms, using Facebook as default:', error.message);
                targetPlatforms = ['facebook'];
            }
        } else if (!targetPlatforms) {
            targetPlatforms = ['facebook']; // Default fallback
        }
        
        console.log(`🤖 Generating ${numContents} variations per platform for:`, targetPlatforms);
        
        const aiVariations = [];
        
        // Different creative angles for variety
        const angles = [
            'emotional and heartwarming',
            'funny and humorous', 
            'urgent and action-oriented',
            'question-based and curious',
            'benefit-focused and practical',
            'story-driven and narrative',
            'trendy and modern',
            'nostalgic and memorable'
        ];
        
        // Generate numContents variations for EACH platform
        for (let i = 0; i < numContents; i++) {
            const variation = {
                id: Date.now() + i,
                topic,
                platforms: {},
                generatedAt: new Date().toISOString()
            };
            
            // Use random angle for each variation
            const randomIndex = Math.floor(Math.random() * angles.length);
            const angle = angles[randomIndex];
            const modifiedTopic = `${topic} (use ${angle} approach)`;
            
            // Generate unique content for each platform in this variation
            for (const platform of targetPlatforms) {
                const platformContent = await AIService.generateAllContent(platform, modifiedTopic);
                variation.platforms[platform] = platformContent;
            }
            
            aiVariations.push(variation);
        }
        
        const totalContentPieces = numContents * targetPlatforms.length;
        
        res.status(200).json({
            status: 'success',
            message: `${numContents} variations per platform generated (${totalContentPieces} total content pieces)`,
            data: {
                variations: aiVariations,
                totalCount: numContents,
                totalContentPieces: totalContentPieces,
                topic: topic,
                targetPlatforms: targetPlatforms
            }
        });
    } catch (error) {
        console.error('❌ generateAIContent - Error:', error);
        next(error);
    }
};

const submitContent = async (req, res, next) => {
    console.log('📤 submitContent called with body:', req.body);
    try {
        const { workflowId } = req.params;
        const { selectedContent, seoAnalysis } = req.body;
        
        // Handle both old format (headline, caption, hashtag) and new format (selectedContent)
        let contentData;
        if (selectedContent) {
            // New multi-platform format
            contentData = {
                selectedContent,
                seoAnalysis: seoAnalysis || null,
                submittedAt: new Date().toISOString()
            };
        } else {
            // Legacy single-platform format
            const { headline, caption, hashtag } = req.body;
            if (!headline || !caption || !hashtag) {
                return next(new AppError('Content is required for submission', 400));
            }
            contentData = {
                headline,
                caption,
                hashtag,
                seoAnalysis: seoAnalysis || null,
                submittedAt: new Date().toISOString()
            };
        }
        
        console.log('📊 SEO analysis data received:', seoAnalysis ? 'Present' : 'Missing');
        console.log('💾 Saving content for approval to database...');
        
        const updatedWorkflow = await FirebaseService.submitContent(workflowId, contentData);
        
        // Create notification for Marketing Lead
        const notificationMessage = selectedContent 
            ? 'Multi-platform content submitted for approval'
            : `Content submitted for approval: ${contentData.headline}`;
            
        await FirebaseService.createMarketingNotification({
            type: 'content_submitted',
            message: notificationMessage,
            user: 'Content Creator'
        });
        
        // Broadcast to Marketing Lead
        io.emit('workflow:content_submitted', {
            workflowId,
            workflow: updatedWorkflow,
            message: notificationMessage,
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Content submitted for approval',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ submitContent - Error:', error);
        next(error);
    }
};

// Helper functions for SEO analysis
const extractPowerWords = (text) => {
    const powerWordsList = ['proven', 'exceptional', 'innovative', 'ultimate', 'exclusive', 'premium', 'guaranteed', 'revolutionary', 'breakthrough', 'amazing', 'incredible', 'outstanding', 'remarkable', 'extraordinary'];
    const words = text.toLowerCase().split(/\s+/);
    return powerWordsList.filter(word => words.some(w => w.includes(word)));
};

const extractEmotionalWords = (text) => {
    const emotionalWordsList = ['exciting', 'amazing', 'incredible', 'love', 'fantastic', 'wonderful', 'brilliant', 'awesome', 'stunning', 'beautiful', 'inspiring', 'thrilling', 'delightful', 'magnificent'];
    const words = text.toLowerCase().split(/\s+/);
    return emotionalWordsList.filter(word => words.some(w => w.includes(word)));
};

const calculateWordComplexity = (text) => {
    const words = text.split(/\s+/);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an'];
    const commonCount = words.filter(word => commonWords.includes(word.toLowerCase())).length;
    const totalWords = words.length;
    const commonPercentage = Math.round((commonCount / totalWords) * 100);
    return {
        common: commonPercentage,
        uncommon: 100 - commonPercentage
    };
};

const calculateReadability = (text) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    let gradeLevel = 'Easy';
    if (avgWordsPerSentence > 20) gradeLevel = 'College';
    else if (avgWordsPerSentence > 15) gradeLevel = '12th Grade';
    else if (avgWordsPerSentence > 10) gradeLevel = '8th Grade';
    else if (avgWordsPerSentence > 8) gradeLevel = '6th Grade';
    
    const readingTime = Math.ceil(words / 200); // Average reading speed
    const fleschScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (text.split(/[aeiouAEIOU]/).length / words))));
    
    return {
        gradeLevel,
        readingTime,
        fleschScore: Math.round(fleschScore)
    };
};

const determineSentiment = (text) => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'outstanding', 'remarkable', 'incredible', 'love', 'like', 'enjoy', 'happy', 'excited', 'thrilled', 'delighted'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed', 'worried', 'concerned'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
};

const approveContent = async (req, res, next) => {
    console.log('✅ approveContent called with params:', req.params);
    try {
        const { workflowId } = req.params;
        const { approvedBy } = req.body;
        
        const updatedWorkflow = await FirebaseService.approveContent(workflowId, approvedBy);
        
        // Create notification for Marketing Lead
        await FirebaseService.createMarketingNotification({
            type: 'content_approved',
            message: `Content approved and ready for design assignment`,
            user: approvedBy
        });
        
        // Invalidate Redis cache
        await redisService.del('workflows:all');
        
        // Broadcast to all users (Content Creator + Graphic Designer)
        io.emit('workflow:content_approved', {
            workflowId,
            workflow: updatedWorkflow,
            approvedBy,
            message: 'Content approved and ready for design assignment',
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Content approved successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ approveContent - Error:', error);
        next(error);
    }
};

const rejectContent = async (req, res, next) => {
    console.log('❌ rejectContent called with params:', req.params);
    try {
        const { workflowId } = req.params;
        const { rejectedBy, feedback } = req.body;
        
        const updatedWorkflow = await FirebaseService.rejectContent(workflowId, rejectedBy, feedback);
        
        // Broadcast to Content Creator
        io.emit('workflow:content_rejected', {
            workflowId,
            workflow: updatedWorkflow,
            rejectedBy,
            feedback,
            message: 'Content rejected - revisions needed',
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Content rejected successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ rejectContent - Error:', error);
        next(error);
    }
};

const updateWorkflow = async (req, res, next) => {
    console.log('✏️ updateWorkflow called with params:', req.params, 'body:', req.body);
    try {
        const { workflowId } = req.params;
        const updateData = req.body;
        
        const updatedWorkflow = await FirebaseService.updateWorkflow(workflowId, updateData);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Workflow updated successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ updateWorkflow - Error:', error);
        next(error);
    }
};

const deleteWorkflow = async (req, res, next) => {
    console.log('🗑️ deleteWorkflow called with params:', req.params);
    try {
        const { workflowId } = req.params;
        
        await FirebaseService.deleteWorkflow(workflowId);
        
        // Invalidate Redis cache
        await redisService.del('workflows:all');
        
        // Broadcast to all users
        io.emit('workflow:deleted', {
            workflowId,
            message: 'Workflow deleted',
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Workflow deleted successfully'
        });
    } catch (error) {
        console.error('❌ deleteWorkflow - Error:', error);
        next(error);
    }
};

const saveDesignDraft = async (req, res, next) => {
    console.log('💾 saveDesignDraft called');
    try {
        const { workflowId } = req.params;
        const { designUrl, publicId, canvasData, description } = req.body;
        
        if (!designUrl) {
            return next(new AppError('Design URL is required', 400));
        }
        
        const draftData = {
            designUrl,
            publicId: publicId || null,
            canvasData: canvasData || null,
            description: description || 'Design draft',
            savedAt: new Date().toISOString()
        };
        
        const updatedWorkflow = await FirebaseService.saveDesignDraft(workflowId, draftData);
        
        res.status(200).json({
            status: 'success',
            message: 'Design draft saved successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ saveDesignDraft - Error:', error);
        next(error);
    }
};

const submitDesign = async (req, res, next) => {
    console.log('🎨 submitDesign called with body:', req.body);
    try {
        const { workflowId } = req.params;
        const designData = req.body;
        
        const updatedWorkflow = await FirebaseService.submitDesign(workflowId, designData);
        
        // Broadcast to Marketing Lead
        io.emit('workflow:design_submitted', {
            workflowId,
            workflow: updatedWorkflow,
            message: 'Design submitted for approval',
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Design submitted for approval',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ submitDesign - Error:', error);
        next(error);
    }
};

const approveDesign = async (req, res, next) => {
    console.log('✅ approveDesign called with params:', req.params);
    try {
        const { workflowId } = req.params;
        const { approvedBy } = req.body;
        
        const updatedWorkflow = await FirebaseService.approveDesign(workflowId, approvedBy);
        
        // Broadcast to all users
        io.emit('workflow:design_approved', {
            workflowId,
            workflow: updatedWorkflow,
            approvedBy,
            message: 'Design approved and ready to post',
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Design approved and posted successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ approveDesign - Error:', error);
        next(error);
    }
};

const rejectDesign = async (req, res, next) => {
    console.log('❌ rejectDesign called with params:', req.params);
    try {
        const { workflowId } = req.params;
        const { rejectedBy, feedback } = req.body;
        
        const updatedWorkflow = await FirebaseService.rejectDesign(workflowId, rejectedBy, feedback);
        
        // Broadcast to Graphic Designer
        io.emit('workflow:design_rejected', {
            workflowId,
            workflow: updatedWorkflow,
            rejectedBy,
            feedback,
            message: 'Design rejected - revisions needed',
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Design rejected successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ rejectDesign - Error:', error);
        next(error);
    }
};

const assignToGraphicDesigner = async (req, res, next) => {
    console.log('🎨 assignToGraphicDesigner called with params:', req.params);
    try {
        const { workflowId } = req.params;
        
        const updatedWorkflow = await FirebaseService.assignToGraphicDesigner(workflowId);
        
        // Broadcast to Graphic Designer
        io.emit('workflow:assigned_to_designer', {
            workflowId,
            workflow: updatedWorkflow,
            message: 'New design task assigned',
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Task assigned to graphic designer successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ assignToGraphicDesigner - Error:', error);
        next(error);
    }
};

const postNow = async (req, res, next) => {
    console.log('📤 postNow called with params:', req.params);
    try {
        const { workflowId } = req.params;
        
        const updatedWorkflow = await FirebaseService.updateWorkflowStatus(
            workflowId, 
            'posted', 
            { currentStage: 'completed' }
        );
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Content posted successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ postNow - Error:', error);
        next(error);
    }
};

const getWorkflowsByMultipleStatuses = async (req, res, next) => {
    console.log('📋 getWorkflowsByMultipleStatuses called');
    try {
        const statuses = req.statuses;
        console.log('📋 getWorkflowsByMultipleStatuses - statuses:', statuses);
        const workflows = await FirebaseService.getWorkflowsByMultipleStatuses(statuses);
        
        res.status(200).json({
            status: 'success',
            data: workflows
        });
    } catch (error) {
        console.error('❌ getWorkflowsByMultipleStatuses - Error:', error);
        next(error);
    }
};

const getWorkflowById = async (workflowId) => {
    try {
        return await FirebaseService.getWorkflowById(workflowId);
    } catch (error) {
        throw error;
    }
};

const getAllWorkflows = async (req, res, next) => {
    console.log('📋 getAllWorkflows called');
    try {
        const cacheKey = 'workflows:all';
        const cached = await redisService.get(cacheKey);
        
        if (cached) {
            console.log('✅ Returning cached workflows');
            return res.status(200).json({
                status: 'success',
                data: cached,
                cached: true
            });
        }
        
        const workflows = await FirebaseService.getAllWorkflows();
        await redisService.set(cacheKey, workflows, 60);
        
        res.status(200).json({
            status: 'success',
            data: workflows
        });
    } catch (error) {
        console.error('❌ getAllWorkflows - Error:', error);
        next(error);
    }
};

export {
    createWorkflow,
    getWorkflowsByStage,
    getWorkflowsByMultipleStatuses,
    getWorkflowById,
    getAllWorkflows,
    generateAIContent,
    submitContent,
    approveContent,
    rejectContent,
    saveDesignDraft,
    submitDesign,
    approveDesign,
    rejectDesign,
    updateWorkflow,
    deleteWorkflow,
    assignToGraphicDesigner,
    setTaskGraphicDesigner,
    getTaskGraphicDesigner,
    postNow
};