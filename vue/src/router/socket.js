const { io } = require('socket.io-client')
import API_URL from './api_url'

export default {
  setup() {
    const socket = io(API_URL, { auth: { token } })
    return { socket }
  },
}
