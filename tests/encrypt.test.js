/**
 * Encryptor 单元测试
 */
const { Encryptor, encrypt, decrypt } = require('../src/encrypt');

describe('Encryptor', () => {
  let encryptor;
  const testKey = 'test-key-12345678901234567890';

  beforeEach(() => {
    encryptor = new Encryptor(testKey);
  });

  describe('encrypt/decrypt', () => {
    test('加密解密字符串', () => {
      const original = 'Hello CostGuard';
      const encrypted = encryptor.encrypt(original);
      const decrypted = encryptor.decrypt(encrypted);

      expect(decrypted).toBe(original);
      expect(encrypted).not.toBe(original);
    });

    test('加密解密对象', () => {
      const original = { name: 'test', value: 123 };
      const encrypted = encryptor.encrypt(original);
      const decrypted = JSON.parse(encryptor.decrypt(encrypted));

      expect(decrypted).toEqual(original);
    });

    test('不同密钥加密的数据无法解密', () => {
      const original = 'secret data';
      const encrypted = encryptor.encrypt(original);

      const otherEncryptor = new Encryptor('different-key');
      expect(() => otherEncryptor.decrypt(encrypted)).toThrow();
    });

    test('便捷函数 encrypt/decrypt', () => {
      const original = 'test data';
      const encrypted = encrypt(original, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(original);
    });
  });

  describe('padKey', () => {
    test('短密钥填充到32字节', () => {
      const enc = new Encryptor('short');
      expect(enc.cipherKey.length).toBe(32);
    });

    test('长密钥截断到32字节', () => {
      const enc = new Encryptor('a'.repeat(50));
      expect(enc.cipherKey.length).toBe(32);
    });
  });

  describe('generateKey', () => {
    test('生成32字符随机密钥', () => {
      const key = encryptor.generateKey();
      expect(key.length).toBe(32);
      expect(typeof key).toBe('string');
    });

    test('每次生成不同密钥', () => {
      const key1 = encryptor.generateKey();
      const key2 = encryptor.generateKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('validateKey', () => {
    test('正确密钥验证通过', () => {
      const encrypted = encryptor.encrypt('test');
      expect(encryptor.validateKey(encrypted)).toBe(true);
    });

    test('错误密钥验证失败', () => {
      const encrypted = encryptor.encrypt('test');
      const otherEnc = new Encryptor('wrong-key');
      expect(otherEnc.validateKey(encrypted)).toBe(false);
    });
  });

  describe('getKeyHash', () => {
    test('生成密钥哈希', () => {
      const hash = encryptor.getKeyHash();
      expect(hash.length).toBe(64); // SHA-256 = 32 bytes = 64 hex chars
    });

    test('相同密钥生成相同哈希', () => {
      const hash1 = encryptor.getKeyHash();
      const hash2 = encryptor.getKeyHash();
      expect(hash1).toBe(hash2);
    });
  });

  describe('错误处理', () => {
    test('解密无效格式数据', () => {
      expect(() => encryptor.decrypt('invalid')).toThrow();
    });

    test('解密损坏数据', () => {
      const encrypted = encryptor.encrypt('test');
      const tampered = encrypted.slice(0, -2) + 'xx';
      expect(() => encryptor.decrypt(tampered)).toThrow();
    });
  });
});
