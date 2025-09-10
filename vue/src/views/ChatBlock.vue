<template>
  <div class="chat-page">
    <ChatRoomNavbar :selectedRoom="selectedRoom" @select-room="selectedRoom = $event" />
    <ChatBox :roomId="selectedRoom" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatRoomNavbar from '@/components/ChatRoomNavbar.vue'
import ChatBox from '@/components/ChatBox.vue'

const selectedRoom = ref(1) // 初始聊天室
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
}
</style>
