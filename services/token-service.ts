import jwt from 'jsonwebtoken'
import refreshModel from '../models/refresh-model'
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '1m' })
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '1y' })
    return { accessToken, refreshToken }
  }

  async storeRefreshToken(token, userId) {
    try {
      await refreshModel.create({ token, userId })
    } catch (error) {
      console.log(error)
    }
  }

  async verifyAccessToken(token) {
    return jwt.verify(token, accessTokenSecret)
  }

  async verifyRefreshToken(token) {
    return jwt.verify(token, refreshTokenSecret)
  }

  async findRefreshToken(userId, refreshToken) {
    return await refreshModel.findOne({
      userId,
      token: refreshToken,
    })
  }

  async updateRefreshToken(userId, refreshToken) {
    return await refreshModel.updateOne({ userId: userId }, { token: refreshToken })
  }
}

export default new TokenService()