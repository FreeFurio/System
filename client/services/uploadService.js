import { ref as dbRef, push, set } from 'firebase/database';
import { db } from './firebase.js';

class UploadService {
  constructor() {
    this.cloudName = 'dyxayxrpp';
    this.uploadPreset = 'unsigned_uploads'; // Custom unsigned preset
  }

  // Upload file to Cloudinary and save URL to database
  async uploadFile(file, folder = 'uploads', userRole = null, username = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Save to database
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: result.secure_url,
        publicId: result.public_id,
        uploadedAt: new Date().toISOString(),
        folder: folder
      };
      
      // Save under existing user structure
      let filesRef;
      if (username) {
        const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
        filesRef = dbRef(db, `${safeUsername}/files`);
      } else {
        filesRef = dbRef(db, 'files');
      }
      
      const newFileRef = push(filesRef);
      await set(newFileRef, fileData);
      
      return {
        success: true,
        url: result.secure_url,
        fileId: newFileRef.key,
        data: fileData
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }


}

export default new UploadService();