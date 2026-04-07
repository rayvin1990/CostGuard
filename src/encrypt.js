/**
 * 数据加密模块 - AES-256 加密/解密
 * 用于保护本地存储的成本数据
 */

const crypto = require('crypto');

class Encryptor {
  /**
   * 创建加密器
   * @param {string} key - 加密密钥 (建议 32 字节 for AES-256)
   */
  constructor(key) {
    // 如果没有提供密钥，从环境变量或配置文件读取
    this.key = key || process.env.COSTGUARD_KEY || this.generateKey();
    // 确保密钥是 32 字节 (AES-256)
    this.cipherKey = this.padKey(this.key);
  }

  /**
   * 生成随机密钥
   * @returns {string} 32 字符随机字符串
   */
  generateKey() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 确保密钥长度为 32 字节
   * @param {string} key - 原始密钥
   * @returns {Buffer} 32 字节密钥
   */
  padKey(key) {
    const keyBuffer = Buffer.from(key, 'utf8');
    if (keyBuffer.length > 32) {
      return keyBuffer.slice(0, 32);
    }
    // 密钥长度不足时拒绝 - 安全起见必须使用完整密钥
    if (keyBuffer.length < 32) {
      throw new Error('Encryption key must be at least 32 bytes');
    }
    return keyBuffer;
  }

  /**
   * 加密数据
   * @param {string|Object} data - 要加密的数据
   * @returns {string} 加密后的 Base64 字符串
   */
  encrypt(data) {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

    // 生成随机 IV
    const iv = crypto.randomBytes(16);

    // 创建 cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', this.cipherKey, iv);

    // 加密
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 返回 IV + 加密数据 (IV:Hex + : + encrypted)
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * 解密数据
   * @param {string} encryptedData - 加密的数据
   * @returns {string} 解密后的原始数据
   */
  decrypt(encryptedData) {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      // 创建 decipher
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.cipherKey, iv);

      // 解密
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (e) {
      throw new Error('Decryption failed');
    }
  }

  /**
   * 加密文件
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   */
  encryptFile(inputPath, outputPath) {
    const fs = require('fs');
    const data = fs.readFileSync(inputPath, 'utf8');
    const encrypted = this.encrypt(data);
    fs.writeFileSync(outputPath, encrypted, 'utf8');
  }

  /**
   * 解密文件
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   */
  decryptFile(inputPath, outputPath) {
    const fs = require('fs');
    const encrypted = fs.readFileSync(inputPath, 'utf8');
    const decrypted = this.decrypt(encrypted);
    fs.writeFileSync(outputPath, decrypted, 'utf8');
  }

  /**
   * 验证密钥是否正确
   * @param {string} encryptedData - 之前加密的数据
   * @returns {boolean} 密钥是否匹配
   */
  validateKey(encryptedData) {
    try {
      this.decrypt(encryptedData);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 生成密钥哈希 (用于存储验证)
   * @returns {string} SHA-256 哈希
   */
  getKeyHash() {
    return crypto.createHash('sha256').update(this.key).digest('hex');
  }
}

// 便捷函数
function encrypt(data, key) {
  const enc = new Encryptor(key);
  return enc.encrypt(data);
}

function decrypt(encryptedData, key) {
  const enc = new Encryptor(key);
  return enc.decrypt(encryptedData);
}

module.exports = { Encryptor, encrypt, decrypt };