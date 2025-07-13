<template>
  <div class="chat-box">
    <div class="header">
      <span>💬 智谱 AI 助手</span>
      <select v-model="selectedModel">
        <option value="chatglm_turbo">ChatGLM Turbo</option>
        <option value="chatglm_std">ChatGLM 标准版</option>
      </select>
    </div>

    <div class="chat-log">
      <div v-for="(msg, index) in messages" :key="index" :class="msg.role">
        <strong>{{ msg.role === "user" ? "你" : "AI" }}</strong>
        : {{ msg.content }}
      </div>
    </div>

    <div class="input-area">
      <input v-model="input" placeholder="请输入..." @keydown.enter="send" />
      <button @click="send">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const input = ref("");
const messages = ref([]);
const selectedModel = ref("chatglm_turbo");

const send = async () => {
  if (!input.value.trim()) return;

  // 用户消息入栈
  messages.value.push({ role: "user", content: input.value });

  const history = [...messages.value];

  input.value = "";

  const res = await axios.post("/api/app/chat-glm/context", {
    model: selectedModel.value,
    messages: history,
  });

  messages.value.push({ role: "assistant", content: res.data });
};
</script>

<style scoped>
.chat-box {
  width: 100%;
  max-width: 600px;
  margin: auto;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}
.header {
  background: #f3f3f3;
  padding: 12px;
  display: flex;
  justify-content: space-between;
}
.chat-log {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}
.user {
  text-align: right;
  color: #4caf50;
}
.assistant {
  text-align: left;
  color: #2196f3;
}
.input-area {
  display: flex;
  border-top: 1px solid #eee;
  padding: 12px;
}
.input-area input {
  flex: 1;
  padding: 8px;
}
.input-area button {
  margin-left: 8px;
}
</style>
