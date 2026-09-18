import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hash de senha com scrypt (nativo do Node — sem adicionar dependência tipo
 * bcrypt só para isto). Formato armazenado: "salt_hex:hash_hex".
 */

const KEYLEN = 64;

export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verificarSenha(senha: string, hashArmazenado: string): boolean {
  const [salt, hashHex] = hashArmazenado.split(":");
  if (!salt || !hashHex) return false;

  const calculado = scryptSync(senha, salt, KEYLEN);
  const armazenado = Buffer.from(hashHex, "hex");
  if (calculado.length !== armazenado.length) return false;

  return timingSafeEqual(calculado, armazenado);
}

export function senhaForte(senha: string): boolean {
  return senha.length >= 6;
}
