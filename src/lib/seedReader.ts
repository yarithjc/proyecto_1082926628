import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface SeedUser {
  email: string;
  password_plain: string;
  name: string;
  role: 'admin' | 'cajero';
}
interface SeedProduct {
  name: string;
  price: number;
  current_stock: number;
}
export interface SeedFile {
  version: string;
  system_name: string;
  users: SeedUser[];
  products: SeedProduct[];
}

let _cached: SeedFile | null = null;

export function readSeed(): SeedFile {
  if (_cached) return _cached;
  const path = join(process.cwd(), 'data', 'seed.json');
  const raw = readFileSync(path, 'utf8');
  _cached = JSON.parse(raw) as SeedFile;
  return _cached;
}

export function getSeedAdmin(): SeedUser {
  const admin = readSeed().users.find((u) => u.role === 'admin');
  if (!admin) throw new Error('seed.json sin admin');
  return admin;
}
