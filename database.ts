import mongoose from 'mongoose'

export default async function DbConnect() {
  const DB_URL = process.env.DB_URL
  //Database connection
  await mongoose.connect(DB_URL!)

  const db = await mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))

  if (db.readyState >= 1) {
    console.log('connected to database')
    return
  }
}
