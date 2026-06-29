import crypto from 'crypto'

/**
 * Real AES-256-GCM encryption for sensitive data like API keys.
 * Uses ENCRYPTION_KEY environment variable as the symmetric key.
 */

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits

/**
 * Get the encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // If key is a hex string (recommended), convert to buffer
  // Otherwise, use it as-is (must be exactly 32 bytes for AES-256)
  if (key.length === 64) {
    // Likely hex string
    return Buffer.from(key, 'hex')
  }

  const buffer = Buffer.from(key)
  if (buffer.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be exactly ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex chars or 32 base64 chars)`)
  }
  return buffer
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns iv:authTag:ciphertext (all hex-encoded) as a single string
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Return format: iv:authTag:ciphertext (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a ciphertext string (from encrypt function)
 * Input format: iv:authTag:ciphertext (all hex-encoded)
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey()
  const parts = ciphertext.split(':')
  const [ivHex, authTagHex, encryptedHex] = parts

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid ciphertext format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let plaintext = decipher.update(encrypted as any, 'hex', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}
