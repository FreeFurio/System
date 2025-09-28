// ========================
// 1) IMPORTS & INITIALIZATION
// ========================

import FirebaseService from '../services/firebase.service.mjs';
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
        
        io.emit('newWorkflow', {
            id: workflowId,
            ...workflowData,
            status: 'content_creation',
            currentStage: 'contentcreator'
        });

        res.status(200).json({
            status: 'success',
            message: 'Workflow created successfully',
            data: { id: workflowId, ...workflowData }
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

const submitContent = async (req, res, next) => {
    console.log('📤 submitContent called with body:', req.body);
    try {
        const { workflowId } = req.params;
        const { headline, caption, hashtag, seoAnalysis } = req.body;
        
        if (!headline || !caption || !hashtag) {
            return next(new AppError('Headline, caption, and hashtag are required', 400));
        }
        
        console.log('📊 SEO analysis data received:', seoAnalysis ? 'Present' : 'Missing');
        
        const contentData = { 
            headline, 
            caption, 
            hashtag, 
            seoAnalysis: seoAnalysis || null,
            submittedAt: new Date().toISOString()
        };
        
        console.log('💾 Saving content with full SEO analysis to database...');
        const updatedWorkflow = await FirebaseService.submitContent(workflowId, contentData);
        
        // Create notification for Marketing Lead
        await FirebaseService.createMarketingNotification({
            type: 'content_submitted',
            message: `Content submitted for approval: ${contentData.headline}`,
            user: 'Content Creator'
        });
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Content submitted for approval with SEO analysis',
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
        
        io.emit('workflowUpdated', updatedWorkflow);
        
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
        
        io.emit('workflowUpdated', updatedWorkflow);
        
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
        
        io.emit('workflowDeleted', { workflowId });
        
        res.status(200).json({
            status: 'success',
            message: 'Workflow deleted successfully'
        });
    } catch (error) {
        console.error('❌ deleteWorkflow - Error:', error);
        next(error);
    }
};

const submitDesign = async (req, res, next) => {
    console.log('🎨 submitDesign called with body:', req.body);
    try {
        const { workflowId } = req.params;
        const designData = req.body;
        
        const updatedWorkflow = await FirebaseService.submitDesign(workflowId, designData);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
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
        
        io.emit('workflowUpdated', updatedWorkflow);
        
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

const assignToGraphicDesigner = async (req, res, next) => {
    console.log('🎨 assignToGraphicDesigner called with params:', req.params);
    try {
        const { workflowId } = req.params;
        
        const updatedWorkflow = await FirebaseService.assignToGraphicDesigner(workflowId);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
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

export {
    createWorkflow,
    getWorkflowsByStage,
    getWorkflowsByMultipleStatuses,
    getWorkflowById,
    submitContent,
    approveContent,
    rejectContent,
    submitDesign,
    approveDesign,
    updateWorkflow,
    deleteWorkflow,
    assignToGraphicDesigner,
    setTaskGraphicDesigner,
    getTaskGraphicDesigner
};