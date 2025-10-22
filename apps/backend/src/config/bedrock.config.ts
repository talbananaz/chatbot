import { registerAs } from '@nestjs/config';

/**
 * Bedrock configuration following the Configuration pattern.
 * Centralizes AWS Bedrock settings for easy management.
 *
 * Supports three authentication modes:
 * 1. AWS SSO Profile: Set AWS_PROFILE
 * 2. Static Credentials: Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 * 3. Default Credentials: Uses AWS SDK default credential chain
 */
export default registerAs('bedrock', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
  profile: process.env.AWS_PROFILE || undefined,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
  model: process.env.BEDROCK_MODEL || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
}));
