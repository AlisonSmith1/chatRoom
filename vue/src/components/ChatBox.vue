<template>
  <div class="chat-container">
    <h2>{{ isPrivate ? '私人聊天室' : '聊天室' }}</h2>

    <p v-if="!isPrivate" :disabled="roomId === null && messages[0]?.username === '系統'"></p>

    <ul ref="chatBox">
      <li v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.username }}:</strong>
        <span v-if="msg.content">{{ msg.content }}</span>

        <!-- 如果有圖片就顯示圖片 -->
        <div v-if="msg.file_url" style="margin-top: 5px">
          <img :src="msg.file_url" alt="圖片" style="max-width: 200px; border-radius: 5px" />
        </div>
        <!-- 判斷條件：只要 msg.file_url 有值就會顯示圖片
不管檔案類型，可能是圖片、影片、PDF 都會被 <img> 嘗試渲染
優點：簡單快速
缺點：如果 file_url 不是圖片，瀏覽器會顯示破圖 -->

        <!-- 如果是圖片 -->
        <!-- <img
            v-if="msg.file_url && msg.file_type?.startsWith('image/')"
            :src="msg.file_url"
            alt="uploaded image"
            style="max-width: 200px; display: block; margin-top: 5px"
          /> -->
        <!-- 判斷條件：只有 msg.file_url 存在 且檔案類型是圖片 (msg.file_type 以 "image/" 開頭)
更安全，不會把 PDF、影片當圖片渲染
缺點：如果後端沒傳 file_type，就會無法顯示圖片 -->
      </li>
    </ul>
    <p v-if="props.typingUser">{{ props.typingUser }} 正在輸入...</p>

    <label>
      上傳圖片
      <input type="file" @change="handleFileUpload" :disabled="!roomId" style="display: none" />
    </label>

    <input
      v-model="message"
      @keyup.enter="$emit('send-message', message)"
      @input="$emit('notifyTyping')"
      @blur="$emit('stopTyping')"
      placeholder="輸入訊息..."
      :disabled="!roomId"
    />

    <button @click="$emit('send-message', message)" :disabled="!roomId">送出</button>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'

const props = defineProps({
  messages: Array,
  roomId: Number,
  isPrivate: Boolean,
  typingUser: String,
})

const chatBox = ref(null)
const message = ref('')
const emit = defineEmits(['send-file', 'send-message', 'notifyTyping', 'stopTyping'])

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    emit('send-file', file)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

function clearInput() {
  message.value = ''
}

onMounted(scrollToBottom)

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
