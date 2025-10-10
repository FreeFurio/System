// Debug script to check Twitter token in Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { config } from './server/config/config.mjs';
import axios from 'axios';

const app = initializeApp(config.firebase);
const db = getDatabase(app, config.firebase.databaseURL);

async function debugTwitterToken() {
  try {
    console.log('🔍 Checking Twitter tokens in Firebase...');
    
    const twitterAccountsRef = ref(db, 'connectedAccounts/admin/twitter');
    const snapshot = await get(twitterAccountsRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No Twitter accounts found in Firebase');
      return;
    }
    
    const accounts = snapshot.val();
    console.log('📊 Found accounts:', Object.keys(accounts));
    
    for (const [accountId, account] of Object.entries(accounts)) {
      console.log(`\n🐦 Account: ${account.username} (${account.name})`);
      console.log('📅 Connected:', account.connectedAt);
      console.log('🔑 Token length:', account.accessToken?.length || 'NO TOKEN');
      console.log('⏰ Token timestamp:', account.tokenTimestamp);
      
      if (account.tokenTimestamp) {
        const tokenAge = (Date.now() - account.tokenTimestamp) / (1000 * 60); // minutes
        console.log('⌛ Token age:', Math.round(tokenAge), 'minutes');
        console.log('🚨 Token expired?', tokenAge > 120 ? 'YES (>2 hours)' : 'NO');
      }
      
      // Show first/last 10 chars of token for debugging
      if (account.accessToken) {
        const token = account.accessToken;
        console.log('🔐 Token preview:', `${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTwitterToken();