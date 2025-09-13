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
      @send-message="sendMessage"
    />
  </div>
</template>

<script setup>
import ChatRoomNavbar from '@/components/ChatRoomNavbar.vue'
import ChatBox from '@/components/ChatBox.vue'
import { ref, nextTick, onMounted, watch } from 'vue'
import { io } from 'socket.io-client'
import API_URL from '../router/api_url'

const selectedRoom = ref(1)
const messages = ref([])

const roomId = ref(null)
const isPrivate = ref(false)

const accountStr = localStorage.getItem('Account')
let token = accountStr ? JSON.parse(accountStr).token : null
const socket = io(API_URL, { auth: { token } })

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
}

// 送訊息
function sendMessage(msg) {
  console.log('準備送出的訊息：', msg, '房間ID：', roomId.value)
  if (!msg.trim() || !roomId.value) return

  const event = isPrivate.value ? 'private message' : 'chat message'
  socket.emit(event, { roomId: roomId.value, content: msg }, (ack) => {
    if (ack?.status === 'ok') console.log(`${isPrivate.value ? '私訊' : '訊息'}送出成功`)
  })
}

// 隨機配對
function findRandomChat() {
  socket.emit('find random chat')
  messages.value = [{ username: '系統', content: '正在等待配對...' }]
  roomId.value = null
}

onMounted(() => {
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

  if (isPrivate.value) {
    isPrivate.value = false
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
</style>
