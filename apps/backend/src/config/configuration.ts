import { registerAs } from '@nestjs/config';

/**
 * Application configuration.
 * Centralizes all application settings using NestJS ConfigService.
 *
 * AWS Bedrock supports three authentication modes:
 * 1. AWS SSO Profile: Set AWS_PROFILE
 * 2. Static Credentials: Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 * 3. Default Credentials: Uses AWS SDK default credential chain
 */
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  bedrock: {
    region: process.env.AWS_REGION || 'us-east-1',
    profile: process.env.AWS_PROFILE || undefined,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
    model: process.env.BEDROCK_MODEL || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  },
}));
