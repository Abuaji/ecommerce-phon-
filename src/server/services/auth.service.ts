import bcrypt from "bcryptjs";

export class AuthService {
  /**
   * Hashes a raw password securely using bcryptjs.
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a raw password against a hashed password.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
