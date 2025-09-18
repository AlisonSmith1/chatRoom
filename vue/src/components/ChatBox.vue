<template>
  <div class="chat-container">
    <h2>{{ isPrivate ? '私人聊天室' : '聊天室' }}</h2>

    <p v-if="!isPrivate" :disabled="roomId === null && messages[0]?.username === '系統'"></p>

    <ul ref="chatBox">
      <li v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.username }}:</strong> {{ msg.content }}
      </li>
      <p v-if="props.typingUser">{{ props.typingUser }} 正在輸入...</p>
    </ul>

    <input
      v-model="message"
      @keyup.enter="$emit('send-message', message)"
      @input="$emit('notifyTyping')"
      @blur="$emit('stopTyping')"
      placeholder="輸入訊息..."
      :disabled="!roomId"
    />
    <button @click="($emit('send-file'), file)" :disabled="!roomId">+</button>

    <button @click="$emit('send-message', message)" :disabled="!roomId">送出</button>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  messages: Array,
  roomId: Number,
  isPrivate: Boolean,
  typingUser: String,
})

const chatBox = ref(null)
const message = ref('')

function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

function clearInput() {
  message.value = ''
}

watch(
  () => props.messages,
  () => {
    scrollToBottom()
    clearInput()
  },
  { deep: true },
)
</script>

<style scoped>
.chat-container {
  width: 100%;
  margin: 20px;
  padding: 10px;
  border: 1px solid #42b983;
  display: flex;
  flex-direction: column;
}
ul {
  list-style: none;
  padding: 0;
  margin-bottom: 10px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: 300px;
}
li {
  padding: 5px;
  word-break: break-word;
  white-space: pre-wrap;
}
input {
  padding: 5px;
  margin-bottom: 5px;
}
button {
  padding: 5px;
  margin-bottom: 5px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media screen and (max-width: 600px) {
  h2 {
    display: none;
  }
  .chat-container {
    width: auto;
    margin: 0px;
    padding: 0px;
    border: none;
  }
}
</style>
