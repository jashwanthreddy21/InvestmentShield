import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

// Collection references
const socialMediaTipsRef = collection(db, 'socialMediaTips');
const marketActivityRef = collection(db, 'marketActivity');

/**
 * Monitor and store social media stock tips
 * @param {Object} tipData - Data about the social media tip
 * @returns {Promise<Object>} - Added tip with ID
 */
export const addSocialMediaTip = async (tipData) => {
  try {
    // Add timestamp and initial analysis status
    const tipWithMeta = {
      ...tipData,
      timestamp: serverTimestamp(),
      analysisStatus: 'pending',
      suspiciousScore: null,
      linkedMarketActivity: [],
      verificationHistory: []
    };
    
    const docRef = await addDoc(socialMediaTipsRef, tipWithMeta);
    return {
      id: docRef.id,
      ...tipWithMeta
    };
  } catch (error) {
    console.error('Error adding social media tip:', error);
    throw error;
  }
};

/**
 * Get social media tips with optional filtering
 * @param {Object} filters - Optional filters (platform, date range, etc.)
 * @param {number} limitCount - Number of tips to retrieve
 * @returns {Promise<Array>} - Array of tip objects
 */
export const getSocialMediaTips = async (filters = {}, limitCount = 50) => {
  try {
    let q = query(socialMediaTipsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    // Apply filters if provided
    if (filters.platform) {
      q = query(q, where('platform', '==', filters.platform));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(q, 
        where('timestamp', '>=', filters.startDate),
        where('timestamp', '<=', filters.endDate)
      );
    }
    
    if (filters.analysisStatus) {
      q = query(q, where('analysisStatus', '==', filters.analysisStatus));
    }

    if (filters.suspiciousScoreMin) {
      q = query(q, where('suspiciousScore', '>=', filters.suspiciousScoreMin));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting social media tips:', error);
    throw error;
  }
};

/**
 * Record unusual market activity
 * @param {Object} activityData - Data about the market activity
 * @returns {Promise<Object>} - Added activity with ID
 */
export const recordMarketActivity = async (activityData) => {
  try {
    // Add timestamp and initial analysis status
    const activityWithMeta = {
      ...activityData,
      timestamp: serverTimestamp(),
      analysisStatus: 'pending',
      linkedTips: [],
      analysisHistory: []
    };
    
    const docRef = await addDoc(marketActivityRef, activityWithMeta);
    return {
      id: docRef.id,
      ...activityWithMeta
    };
  } catch (error) {
    console.error('Error recording market activity:', error);
    throw error;
  }
};

/**
 * Get market activity with optional filtering
 * @param {Object} filters - Optional filters (stock, date range, etc.)
 * @param {number} limitCount - Number of activities to retrieve
 * @returns {Promise<Array>} - Array of activity objects
 */
export const getMarketActivity = async (filters = {}, limitCount = 50) => {
  try {
    let q = query(marketActivityRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    // Apply filters if provided
    if (filters.stock) {
      q = query(q, where('stock', '==', filters.stock));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(q, 
        where('timestamp', '>=', filters.startDate),
        where('timestamp', '<=', filters.endDate)
      );
    }
    
    if (filters.analysisStatus) {
      q = query(q, where('analysisStatus', '==', filters.analysisStatus));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting market activity:', error);
    throw error;
  }
};

/**
 * Link social media tip to market activity
 * @param {string} tipId - Social media tip ID
 * @param {string} activityId - Market activity ID
 * @returns {Promise<void>}
 */
export const linkTipToActivity = async (tipId, activityId) => {
  try {
    const tipRef = doc(db, 'socialMediaTips', tipId);
    const activityRef = doc(db, 'marketActivity', activityId);
    
    // Get current data
    const tipDoc = await getDocs(tipRef);
    const activityDoc = await getDocs(activityRef);
    
    if (!tipDoc.exists() || !activityDoc.exists()) {
      throw new Error('Tip or activity not found');
    }
    
    const tipData = tipDoc.data();
    const activityData = activityDoc.data();
    
    // Update tip with linked activity
    await updateDoc(tipRef, {
      linkedMarketActivity: [...(tipData.linkedMarketActivity || []), {
        id: activityId,
        timestamp: serverTimestamp(),
        stockSymbol: activityData.stock,
        activityType: activityData.type
      }]
    });
    
    // Update activity with linked tip
    await updateDoc(activityRef, {
      linkedTips: [...(activityData.linkedTips || []), {
        id: tipId,
        timestamp: serverTimestamp(),
        platform: tipData.platform,
        author: tipData.author
      }]
    });
  } catch (error) {
    console.error('Error linking tip to activity:', error);
    throw error;
  }
};

/**
 * Update social media tip analysis
 * @param {string} id - Tip ID
 * @param {Object} analysisData - Analysis data including status and score
 * @returns {Promise<void>}
 */
export const updateTipAnalysis = async (id, analysisData) => {
  try {
    const tipRef = doc(db, 'socialMediaTips', id);
    
    // Add analysis event to history
    const analysisEvent = {
      timestamp: serverTimestamp(),
      status: analysisData.status,
      score: analysisData.suspiciousScore,
      method: analysisData.method,
      notes: analysisData.notes
    };
    
    await updateDoc(tipRef, {
      analysisStatus: analysisData.status,
      suspiciousScore: analysisData.suspiciousScore,
      verificationHistory: analysisData.appendToHistory ? 
        [...(analysisData.currentHistory || []), analysisEvent] : 
        [analysisEvent],
      lastAnalyzed: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating tip analysis:', error);
    throw error;
  }
};

/**
 * Calculate suspicious score for social media tip
 * @param {Object} tipData - Tip data
 * @param {Object} marketData - Related market data
 * @returns {number} - Suspicious score (0-100)
 */
export const calculateSuspiciousScore = (tipData, marketData = {}) => {
  // Base score starts at 30 (somewhat suspicious by default)
  let score = 30;
  
  // This is a placeholder for the actual scoring algorithm
  // In a real implementation, this would include:
  // 1. Analysis of tip content and claims
  // 2. Author credibility and history
  // 3. Timing relative to market movements
  // 4. Correlation with other suspicious tips
  // 5. Unusual trading patterns following the tip
  
  // Example scoring factors:
  
  // Author credibility (verified accounts are less suspicious)
  if (tipData.authorVerified) {
    score -= 15;
  }
  
  // New accounts are more suspicious
  if (tipData.authorAccountAge && tipData.authorAccountAge < 30) { // less than 30 days
    score += 20;
  }
  
  // Unusual market activity following the tip increases suspicion
  if (marketData.unusualVolume) {
    score += 15;
  }
  
  // Extreme claims increase suspicion
  if (tipData.content && (tipData.content.includes('guaranteed') || 
                         tipData.content.includes('100%') ||
                         tipData.content.includes('double your money'))) {
    score += 25;
  }
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
};