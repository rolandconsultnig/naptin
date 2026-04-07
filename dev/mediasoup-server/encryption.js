/**
 * Client-to-client payload encryption utilities
 * Provides AES-256-GCM encryption for additional security layer
 */

const crypto = require('crypto');
const CryptoJS = require('crypto-js');

class ClientEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
  }

  /**
   * Generate encryption key from user password/token
   */
  generateKey(sharedSecret) {
    return crypto.scryptSync(sharedSecret, 'salt', this.keyLength);
  }

  /**
   * Encrypt payload for client-to-client communication
   * @param {string} data - Data to encrypt
   * @param {string} encryptionKey - Shared encryption key
   * @returns {Object} Encrypted data with IV and auth tag
   */
  encryptPayload(data, encryptionKey) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        crypto.scryptSync(encryptionKey, 'salt', this.keyLength),
        iv
      );

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt payload
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} encryptionKey - Shared encryption key
   * @returns {string} Decrypted data
   */
  decryptPayload(encryptedData, encryptionKey) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        crypto.scryptSync(encryptionKey, 'salt', this.keyLength),
        Buffer.from(encryptedData.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Generate shared secret between two clients
   */
  generateSharedSecret(userId1, userId2, sessionKey) {
    const secret = `${userId1}_${userId2}_${sessionKey}`;
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  /**
   * Simple AES encryption using CryptoJS for JSON data
   */
  encryptJSON(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  /**
   * Simple AES decryption using CryptoJS for JSON data
   */
  decryptJSON(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}

module.exports = new ClientEncryption();
