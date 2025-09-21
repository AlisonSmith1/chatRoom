<template>
  <div class="chat-page">
    <!-- 監聽子元件的事件 -->
    <ChatRoomNavbar
      :selectedRoom="selectedRoom"
      @select-room="selectedRoom = $event"
      @find-random-chat="findRandomChat"
      :roomId="roomId"
    />
    <ChatBox
      :messages="messages"
      :roomId="roomId"
      :isPrivate="isPrivate"
      :typingUser="typingUser"
      @send-message="sendMessage"
      @notifyTyping="notifyTyping"
      @stopTyping="stopTyping"
      @send-file="sendFile"
    />
  </div>
</template>

<script setup>
import ChatRoomNavbar from '@/components/ChatRoomNavbar.vue'
import ChatBox from '@/components/ChatBox.vue'
import { ref, onMounted, watch } from 'vue'
import { io } from 'socket.io-client'
import API_URL from '../router/api_url'

const selectedRoom = ref(1)
const messages = ref([])
const roomId = ref(null)
const isPrivate = ref(false)
const typingUser = ref('')
let typingTimeout = null
let socket = null

// 處理訊息
function handleMessage(msg) {
  messages.value.push(msg)
}

// 加入房間
function joinRoom(id) {
  if (!id || roomId.value === id) return
  roomId.value = id
  messages.value = []
  socket.emit('join room', id)
  isPrivate.value = false // 確保切回一般聊天室
}

// 送訊息
function sendMessage(msg) {
  if (!msg.trim() || !roomId.value) return

  const event = isPrivate.value ? 'private message' : 'chat message'
  socket.emit(event, { roomId: roomId.value, content: msg }, (ack) => {
    if (ack?.status === 'ok') {
      console.log(`${isPrivate.value ? '私訊' : '訊息'}送出成功`)
      message.value = '' // 清空輸入框
    }
  })
}

// 隨機配對
function findRandomChat() {
  socket.emit('find random chat')
  messages.value = [{ username: '系統', content: '正在等待配對...' }]
  roomId.value = null
}

function notifyTyping() {
  socket.emit('typing', roomId.value)
}

function stopTyping() {
  socket.emit('stop typing', roomId.value)
}

async function sendFile(file) {
  if (!roomId.value) return

  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('Account') ? JSON.parse(localStorage.getItem('Account')).token : ''}`,
    },
    body: formData,
  })

  const data = await res.json()
  console.log('data', data)
  const fileUrl = data.url

  socket.emit('send file', { roomId: roomId.value, fileUrl, fileType: file.type })
}

onMounted(async () => {
  const accountStr = localStorage.getItem('Account')
  let token = accountStr ? JSON.parse(accountStr).token : null

  if (!token) {
    window.location.href = '/login'
  }

  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      window.location.href = '/login'
      return
    }
    socket = io(API_URL, { auth: { token: token } })

    if (selectedRoom.value) joinRoom(selectedRoom.value)
    isPrivate.value = false

    socket.on('chat message', handleMessage)
    socket.on('private message', handleMessage)

    socket.on('chat history', (history) => {
      messages.value = history
      console.log('歷史訊息載入完成')
    })
    socket.on('waiting', () => {
      messages.value = [{ username: '系統', content: '正在等待配對...' }]
      roomId.value = null
      console.log('正在等待配對...')
    })
    socket.on('matched', ({ roomId: privateRoomId }) => {
      roomId.value = privateRoomId
      isPrivate.value = true
      messages.value = []

      console.log('配對成功，房間ID:', privateRoomId)
    })
    socket.on('typing', ({ username }) => {
      typingUser.value = username
    })

    socket.on('stop typing', ({ username }) => {
      if (typingUser.value === username) typingUser.value = ''
    })

    socket.on('file message', (msg) => {
      messages.value.push(msg)
    })
  } catch (err) {
    console.error(err)
    window.location.href = '/login'
  }
})

// 監聽 props 更新
watch(selectedRoom, (newRoomId) => {
  if (newRoomId) {
    joinRoom(newRoomId)
    isPrivate.value = false
  }
})
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
}

@media screen and (max-width: 600px) {
  .chat-page {
    width: 100%;
    border-bottom: 1px solid #ccc;
    display: flex;
    flex-direction: column;
  }
}
</style>
