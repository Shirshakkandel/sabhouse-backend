import Jimp from 'jimp'
import path from 'path'
import UserDto from '../dtos/user-dto'
import userService from '../services/user-service'

class ActivateController {
  async activate(req, res) {
    //Activation logic
    const { name, avatar } = req.body
    if (!name || !avatar) {
      res.status(400).json({ message: 'All Fields are required!' })
    }

    //Image Base 64
    const buffer = Buffer.from(avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64')
    const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`
    // 32478362874-3242342342343432.png

    try {
      const jimResp = await Jimp.read(buffer)
      jimResp.resize(150, Jimp.AUTO).write(path.resolve(__dirname, `../storage/${imagePath}`))
    } catch (err) {
      res.status(500).json({ message: 'Could not process the image' })
    }

    try {
      //update user
      const user = await userService.findUser({ _id: req.user._id })
      if (!user) {
        res.status(404).json({ message: 'User not Found' })
      }
      user.activated = true
      user.name = name
      user.avatar = `/storage/${imagePath}`
      user.save()
      res.json({ user: new UserDto(user), auth: true })
    } catch (error) {
      res.status(500).json({ message: 'Somethings went wrong!' })
    }
  }
}

export default new ActivateController()
