import crypto from 'crypto'
import twilio1 from 'twilio'
import hashService from './hash-service'
const smsSid = process.env.SMS_SID
const smsAuthToken = process.env.SMS_AUTH_TOKEN

const twilio = twilio1(smsSid, smsAuthToken, { lazyLoading: true })

class OtpService {
  async generateOtp() {
    const otp = crypto.randomInt(1000, 9999)
    return otp
  }

  async sendBySms(phone: string, otp: number) {
    return await twilio.messages.create({
      to: phone,
      from: process.env.SMS_FROM_NUMBER,
      body: `Your coderhouse OTP is ${otp}`,
    })
  }

  verifyOtp(hashOtp: string, data: string) {
    let computedHash = hashService.hashOtp(data)
    return computedHash === hashOtp
  }
}
export default new OtpService()
