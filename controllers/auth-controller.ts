import hashService from '../services/hash-service'
import otpService from '../services/otp-service'
import { Request, Response } from 'express'
import userService from '../services/user-service'
import tokenService from '../services/token-service'
import UserDto from '../dtos/user-dto'

class AuthController {
  //using phone number
  async sendOtp(req: any, res: any) {
    const { phone } = req.body
    if (!phone) {
      res.status(400).json({ message: 'Phone field is required' })
    }
    const otp = await otpService.generateOtp()
    const ttl = 1000 * 60 * 2
    const expires = Date.now() + ttl
    const data = `${phone}.${otp}.${expires}` 
    const hash = hashService.hashOtp(data)

    try {
      // await otpService.sendBySms(phone, otp)
      res.json({ hash: `${hash}.${expires}`, phone, otp })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'message sending failed' })
    }
  }

  async verifyOtp(req: Request, res: Response) {
    const { otp, hash, phone } = req.body
    if (!otp || !hash || !phone) {
      res.status(400).json({ message: 'All fields are required' })
    }

    const [hashOtp, expires] = hash.split('.')
    if (Date.now() > expires) {
      res.status(400).json({ message: 'OTP expired!' })
    }

    const data = `${phone}.${otp}.${expires}`
    const isValid = otpService.verifyOtp(hashOtp, data)
    !isValid && res.status(400).json({ message: 'Invalid OTP' })
    // res.json({ message: `Otp is ${isValid}` })
    let user
    try {
      user = await userService.findUser({ phone })
      !user && res.status(500).json({ message: `Db error` })
      user = await userService.createUser({ phone })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Db error' })
    }

    const { accessToken, refreshToken } = tokenService.generateTokens({
      _id: user.id,
      activated: false,
    })

    await tokenService.storeRefreshToken(refreshToken, user._id)
    res.cookie('refreshToken', refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true })
    res.cookie('accessToken', accessToken, { maxAge: 1000 * 60 * 60 * 24 * 24, httpOnly: true })

    const userDto = new UserDto(user)
    res.json({ user: userDto, auth: true })
  }

  async refresh(req, res) {
    //get refresh token from cookie
    const { refreshToken: refreshTokenFromCookie } = req.cookies
    //check if token is valid
    let userData
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie)
    } catch (error) {
      return res.status(401).json({ message: 'Invalid Token' })
    }
    //check if token is in db
    try {
      const token = await tokenService.findRefreshToken(userData._id, refreshTokenFromCookie)
      if (!token) return res.status(401).json({ message: 'Invalid token' })
    } catch (error) {
      return res.status(401).json({ message: 'Internal error' })
    }

    //check if valid user
    const user = await userService.findUser({ _id: userData._id })
    if (!user) return res.status(404).json({ message: 'No user' })

    //generate new tokens
    const { refreshToken, accessToken } = tokenService.generateTokens({ _id: userData._id })

    //update refresh token
    try {
      await tokenService.updateRefreshToken(userData._id, refreshToken)
    } catch (error) {
      return res.status(500).json({ message: 'Internal error' })
    }
    //put in cookie
    res.cookie('refreshToken', refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true })

    res.cookie('accessToken', accessToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true })

    //response
    const userDto = new UserDto(user)
    res.json({ user: userDto, auth: true })
  }
}

export default new AuthController()
