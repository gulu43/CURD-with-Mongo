import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
export const publicPath = path.resolve(__dirname, 'public')
export const dotenvPath = path.resolve(__dirname, '.env' )

