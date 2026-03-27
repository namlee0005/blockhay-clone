import { createClient } from '@sanity/client'
import 'dotenv/config'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gpng8txf",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN, // Need write access
  apiVersion: '2024-03-27'
})

async function seed() {
  console.log("Not implemented yet - manual entry is better for first test")
}
seed()
