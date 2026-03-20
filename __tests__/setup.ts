// Global test setup — runs before each test file
import { setupDenoGlobal, setStandardEnv } from './mocks/deno-globals'

// Set up Deno global mock
setupDenoGlobal()
setStandardEnv()
