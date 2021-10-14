import tokenService from '../services/token-service'

export default async function (req, res, next) {
  try {
    const { accessToken } = req.cookies
    //we need cookie parser for this

    if (!accessToken) {
      throw new Error()
    }
    console.log(accessToken)

    const userData = await tokenService.verifyAccessToken(accessToken)

    if (!userData) {
      throw new Error()
    }

    req.user = userData
    //  console.log(userData)

    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}
