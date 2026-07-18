/** Mirrors backend UserResponseDto — passwordHash never leaves the server. */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}
