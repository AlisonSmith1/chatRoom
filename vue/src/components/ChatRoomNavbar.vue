<template>
  <div class="navbar">
    <p>公開</p>
    <ul>
      <li
        v-for="room in rooms"
        :key="room.id"
        :class="{ active: room.id === selectedRoom }"
        @click="$emit('select-room', room.id)"
      >
        {{ room.name }}
      </li>
    </ul>
    <p>私人</p>
    <button>新增聊天室</button>
    <ul>
      <li>私人聊天室2</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  selectedRoom: Number,
})

const rooms = ref([
  { id: 1, name: 'General' },
  { id: 2, name: 'Random' },
  { id: 3, name: 'Tech' },
])
</script>

<style scoped>
.navbar {
  width: 150px;
  border-right: 1px solid #ccc;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 10px;
  cursor: pointer;
}
.active {
  background-color: #42b983;
  color: white;
}
</style>
