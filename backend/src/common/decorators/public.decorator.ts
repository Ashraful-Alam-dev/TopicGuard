import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or controller) as not requiring authentication.
 * Used by JwtAuthGuard, which is registered globally.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
