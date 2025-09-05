<template>
  <div>
    <h1>我的網站</h1>
    <nav>
      <!-- 用 router-link 取代 <a>，避免整頁刷新 -->
      <router-link to="/">首頁</router-link>
      <router-link to="/register">註冊</router-link>
      <router-link to="/login">登入</router-link>
      <router-link to="/chat">聊天</router-link>
    </nav>

    <!-- 顯示路由對應的元件 -->
    <router-view></router-view>
  </div>
</template>
