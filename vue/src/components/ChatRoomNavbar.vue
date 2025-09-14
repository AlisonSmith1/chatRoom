<template>
  <div class="navbar">
    <button @click="$emit('find-random-chat')" :disabled="!props.roomId">隨機配對</button>

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

button {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
  background-color: none;
  border: none;
  cursor: pointer;
}

.active {
  background-color: #42b983;
  color: white;
}

@media screen and (max-width: 600px) {
  .navbar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ccc;
    display: flex;
    flex-direction: column;
  }
  ul {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
}
</style>
