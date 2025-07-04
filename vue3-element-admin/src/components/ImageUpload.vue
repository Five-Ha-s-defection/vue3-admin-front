<template>
  <div class="image-upload">
    <div
      class="upload-area"
      :class="{ 'is-dragover': isDragover, 'is-disabled': disabled }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="handleClick"
    >
      <div v-if="!imageUrl" class="upload-placeholder">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <div class="upload-text">
          <span>点击上传</span>
          <span class="upload-hint">或将图片拖拽到此处</span>
        </div>
        <div class="upload-tip">支持 JPG、PNG、GIF 格式，文件大小不超过 {{ maxSize }}MB</div>
      </div>
      
      <div v-else class="image-preview">
        <img :src="imageUrl" alt="预览图" />
        <div class="image-actions">
          <el-button type="primary" size="small" @click="handlePreview">
            <el-icon><View /></el-icon>
          </el-button>
          <el-button type="danger" size="small" @click="handleRemove">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 上传进度条 -->
    <el-progress
      v-if="uploadProgress > 0 && uploadProgress < 100"
      :percentage="uploadProgress"
      :stroke-width="4"
      status="success"
    />

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      <el-icon><Warning /></el-icon>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Delete, Warning } from '@element-plus/icons-vue'
import { uploadImage, type ProgressCallback } from '@/api/upload'

interface Props {
  modelValue?: string
  maxSize?: number // MB
  disabled?: boolean
  accept?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'success', response: any): void
  (e: 'error', error: any): void
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 5,
  disabled: false,
  accept: 'image/*'
})

const emit = defineEmits<Emits>()

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const imageUrl = ref('')
const isDragover = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  imageUrl.value = newValue || ''
}, { immediate: true })

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndUpload(file)
  }
  // 清空 input 值，允许重复选择同一文件
  target.value = ''
}

// 处理拖拽
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (!props.disabled) {
    isDragover.value = true
  }
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragover.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragover.value = false
  
  if (props.disabled) return
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      validateAndUpload(file)
    } else {
      showError('请选择图片文件')
    }
  }
}

// 处理点击上传
const handleClick = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

// 验证并上传文件
const validateAndUpload = async (file: File) => {
  // 清除之前的错误
  errorMessage.value = ''
  
  // 验证文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    showError(`文件大小不能超过 ${props.maxSize}MB`)
    return
  }
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    showError('只支持 JPG、PNG、GIF 格式的图片')
    return
  }
  
  try {
    // 显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    // 上传文件
    uploadProgress.value = 0
    const response = await uploadImage(file, (progress: number) => {
      uploadProgress.value = progress
    })
    
    // 上传成功
    imageUrl.value = response.url
    emit('update:modelValue', response.url)
    emit('success', response)
    ElMessage.success('上传成功')
    
  } catch (error: any) {
    showError(error.message || '上传失败')
    emit('error', error)
  } finally {
    uploadProgress.value = 0
  }
}

// 预览图片
const handlePreview = () => {
  if (imageUrl.value) {
    // 使用 Element Plus 的图片预览组件
    const h = window.open('', '_blank')
    if (h) {
      h.document.write(`
        <html>
          <head><title>图片预览</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
            <img src="${imageUrl.value}" style="max-width:90%;max-height:90%;object-fit:contain;" />
          </body>
        </html>
      `)
    }
  }
}

// 删除图片
const handleRemove = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    imageUrl.value = ''
    emit('update:modelValue', '')
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 显示错误信息
const showError = (message: string) => {
  errorMessage.value = message
  ElMessage.error(message)
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-area.is-dragover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-area.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-placeholder {
  text-align: center;
  color: #8c8d91;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.upload-hint {
  display: block;
  font-size: 14px;
  color: #c0c4cc;
  margin-top: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #c0c4cc;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.error-message {
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style> 