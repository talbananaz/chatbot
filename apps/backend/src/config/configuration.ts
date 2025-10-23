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
    region: 'us-east-1',
    profile: 'stage',  // Use profile instead of hardcoded credentials
    accessKeyId: undefined,
    secretAccessKey: undefined,
    sessionToken: undefined,
    model: 'anthropic.claude-3-haiku-20240307-v1:0',  // Try Haiku which has broader access
  },
}));
