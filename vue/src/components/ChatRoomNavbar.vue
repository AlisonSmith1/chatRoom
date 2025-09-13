<template>
  <div class="navbar">
    <!-- <p>公開</p> -->
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

    <button @click="$emit('find-random-chat')" :disabled="!props.roomId">隨機一對一聊天</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  selectedRoom: Number,
  roomId: Number,
})

const rooms = ref([
  { id: 1, name: 'General-1' },
  { id: 2, name: 'General-2' },
  { id: 3, name: 'General-3' },
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
