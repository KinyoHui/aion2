<template>
  <div class="relative h-full flex flex-col p-2 sm:p-4">
    <!-- Camera Viewfinder / Upload Area -->
    <div class="relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileUpload"
        class="hidden"
        id="scan-upload"
      />
      
      <!-- Placeholder / Initial State -->
      <label
        v-if="!previewImage"
        for="scan-upload"
        class="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-700/30 transition-colors p-4 sm:p-8"
      >
        <div class="w-40 h-40 sm:w-64 sm:h-64 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center gap-4 mb-4 sm:mb-8 relative group">
          <div class="absolute inset-0 bg-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Camera class="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 group-hover:text-cyan-400 transition-colors" />
          <span class="text-gray-400 font-medium group-hover:text-cyan-300 text-sm sm:text-base">點擊拍攝或上傳</span>
        </div>
        <p class="text-gray-500 text-xs sm:text-sm max-w-xs text-center">
          支持自動識別玩家 ID 和伺服器名稱
        </p>
      </label>

      <!-- Image Preview with Scanning Effect -->
      <div v-else class="relative w-full h-full flex items-center justify-center bg-black/50">
        <img 
          :src="previewImage" 
          class="max-w-full max-h-full object-contain" 
          alt="Preview" 
        />
        
        <!-- Scanning Overlay -->
        <div v-if="isProcessing" class="absolute inset-0 z-10 pointer-events-none">
          <div class="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent h-20 animate-scan"></div>
        </div>

        <!-- Close Preview Button -->
        <button 
          @click="resetScanner" 
          class="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 z-20"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Processing Indicator -->
      <div v-if="isProcessing" class="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-500/30 flex items-center gap-3 z-20">
        <Loader2 class="w-5 h-5 animate-spin text-cyan-400" />
        <span class="text-cyan-100 font-medium tracking-wide">正在識別文字...</span>
      </div>
    </div>

    <!-- Bottom Sheet / Results Panel -->
    <Transition name="slide-up">
      <div 
        v-if="showResultPanel" 
        class="absolute bottom-0 left-0 w-full bg-gray-900 rounded-t-3xl shadow-2xl border-t border-gray-700 z-30 flex flex-col max-h-[80vh]"
      >
        <!-- ... content unchanged ... -->
        <!-- Drag Handle -->
        <div class="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div class="w-12 h-1.5 bg-gray-600 rounded-full"></div>
        </div>

        <div class="p-6 overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <ScanText class="w-5 h-5 text-cyan-400" />
              識別結果
            </h3>
            <span class="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
              {{ matchedPlayers.length }} 個匹配
            </span>
          </div>

          <!-- OCR Text Display -->
          <div class="mb-6">
            <label class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">原始文本</label>
            <div class="bg-gray-900/50 p-3 rounded-lg border border-gray-700 text-gray-300 text-sm font-mono break-all">
              {{ recognizedText }}
            </div>
          </div>

          <!-- Match Selection -->
          <div class="space-y-4 mb-8">
            <label class="text-xs font-medium text-gray-400 uppercase tracking-wider block">匹配玩家</label>
            
            <div v-if="matchedPlayers.length > 0" class="space-y-2">
              <div 
                v-for="player in matchedPlayers" 
                :key="player.id"
                @click="selectedPlayerId = player.id"
                class="p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between group"
                :class="selectedPlayerId === player.id 
                  ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                  : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'"
              >
                <div>
                  <div class="font-bold text-white group-hover:text-cyan-300 transition-colors">{{ player.name }}</div>
                  <div class="text-xs text-gray-400">{{ player.full_id_string }}</div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                    {{ player.servers?.name }}
                  </span>
                  <span 
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    :class="player.matchScore > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'"
                  >
                    {{ player.matchScore }}%
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
              <p class="text-red-400 text-sm">未找到匹配玩家</p>
              <button class="mt-2 text-xs text-red-300 underline hover:text-red-200">手動添加玩家</button>
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="resetScanner"
              class="py-3 px-4 rounded-xl font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              重新掃描
            </button>
            <button 
              @click="saveRecord"
              :disabled="!selectedPlayerId || isSaving"
              class="py-3 px-4 rounded-xl font-bold text-black bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:text-gray-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              {{ isSaving ? '保存中...' : '確認保存' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- History Drawer Toggle (Bottom) -->
    <div 
      v-if="!showResultPanel && !isProcessing && !previewImage"
      class="mt-2 sm:mt-4"
    >
      <div class="flex items-center justify-between mb-2 px-2">
        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">最近記錄</h3>
        <button @click="loadScanRecords" class="text-cyan-400 hover:text-cyan-300 text-xs">刷新</button>
      </div>
      
      <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
        <div 
          v-for="record in scanRecords" 
          :key="record.id"
          class="flex-shrink-0 w-40 bg-gray-800/80 p-3 rounded-lg border border-gray-700 snap-start"
        >
          <div class="font-semibold text-sm truncate text-white">{{ record.players?.name }}</div>
          <div class="text-xs text-gray-500 truncate mb-2">{{ record.players?.servers?.name }}</div>
          <div class="text-[10px] text-gray-600">{{ formatDate(record.created_at) }}</div>
        </div>
        
        <div v-if="scanRecords.length === 0" class="w-full text-center py-4 text-gray-600 text-sm">
          暫無記錄
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { createWorker } from 'tesseract.js'
import { Camera, Loader2, X, ScanText } from 'lucide-vue-next'
import { supabase } from '../lib/supabase.js'

const fileInput = ref(null)
const isProcessing = ref(false)
const showResultPanel = ref(false)
const recognizedText = ref('')
const selectedPlayerId = ref('')
const isSaving = ref(false)
const matchedPlayers = ref([])
const scanRecords = ref([])
const previewImage = ref(null)

let worker = null

onMounted(async () => {
  worker = await createWorker('eng')
  await loadScanRecords()
})

const resetScanner = () => {
  showResultPanel.value = false
  previewImage.value = null
  recognizedText.value = ''
  selectedPlayerId.value = ''
  matchedPlayers.value = []
  if (fileInput.value) fileInput.value.value = ''
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Create preview
  previewImage.value = URL.createObjectURL(file)
  isProcessing.value = true
  recognizedText.value = ''
  showResultPanel.value = false

  try {
    // Compress image if larger than 2MB
    let processedFile = file
    if (file.size > 2 * 1024 * 1024) { // 2MB
      processedFile = await compressImage(file)
    }

    const { data: { text } } = await worker.recognize(processedFile)
    recognizedText.value = text.trim()
    await findMatchingPlayers(recognizedText.value)
    showResultPanel.value = true
  } catch (error) {
    console.error('OCR Error:', error)
    alert('識別失敗，請重試')
    resetScanner()
  } finally {
    isProcessing.value = false
  }
}

const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const maxSize = 1920
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        }))
      }, 'image/jpeg', 0.8)
    }

    img.src = URL.createObjectURL(file)
  })
}

const findMatchingPlayers = async (text) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        servers (
          name
        )
      `)

    if (error) throw error

    // Extract name and server from OCR text using regex
    const match = text.match(/^(.+?)\[(.+?)\]$/)
    let extractedName = ''
    let extractedServer = ''

    if (match) {
      extractedName = match[1].trim()
      extractedServer = match[2].trim()
    } else {
      const bracketMatch = text.match(/\[(.+?)\]/)
      if (bracketMatch) {
        extractedServer = bracketMatch[1].trim()
        extractedName = text.replace(/\[.*\]/, '').trim()
      }
    }

    // Fuzzy matching algorithm
    const matches = data.map(player => {
      let score = 0
      const playerName = player.name.toLowerCase()
      const playerServer = player.servers?.name.toLowerCase() || ''
      const playerFullId = player.full_id_string.toLowerCase()

      const nameLower = extractedName.toLowerCase()
      const serverLower = extractedServer.toLowerCase()

      if (playerName === nameLower) score += 100
      else if (playerName.includes(nameLower) || nameLower.includes(playerName)) score += 50
      else if (nameLower && (playerName.includes(nameLower) || nameLower.includes(playerName))) score += 30

      if (playerServer === serverLower) score += 50
      else if (playerServer.includes(serverLower) || serverLower.includes(playerServer)) score += 25

      if (playerFullId.includes(text.toLowerCase())) score += 20

      return { ...player, matchScore: score }
    })

    matchedPlayers.value = matches
      .filter(player => player.matchScore > 10)
      .sort((a, b) => b.matchScore - a.matchScore)

    if (matchedPlayers.value.length > 0 && matchedPlayers.value[0].matchScore >= 50) {
      selectedPlayerId.value = matchedPlayers.value[0].id
    }
  } catch (e) {
    console.error('Error loading players:', e)
    alert('無法加載玩家數據，請檢查網絡或數據庫配置')
  }
}

const saveRecord = async () => {
  if (!selectedPlayerId.value) {
    alert('請先選擇一個玩家')
    return
  }

  isSaving.value = true

  try {
    const { error } = await supabase
      .from('scan_records')
      .insert([{
        player_id: selectedPlayerId.value
      }])

    if (error) throw error

    alert('記錄保存成功！')
    resetScanner()
    loadScanRecords()
  } catch (e) {
    console.error('Error saving record:', e)
    alert('保存記錄失敗: ' + (e.message || '未知錯誤'))
  } finally {
    isSaving.value = false
  }
}

const loadScanRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('scan_records')
      .select(`
        *,
        players (
          name,
          full_id_string,
          servers (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    scanRecords.value = data
  } catch (e) {
    console.error('Error loading scan records:', e)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>
