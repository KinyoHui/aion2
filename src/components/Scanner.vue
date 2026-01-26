<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold text-cyan-400 mb-6">掃描記錄</h2>

    <!-- Upload Section -->
    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileUpload"
        class="hidden"
        id="scan-upload"
      />
      <label
        for="scan-upload"
        class="w-full border-2 border-dashed border-cyan-500 rounded-lg py-12 px-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-cyan-400 hover:bg-gray-700/50 transition-all duration-300"
      >
        <div class="flex items-center justify-center gap-2">
          <Camera class="w-8 h-8 text-cyan-400" v-if="!isProcessing" />
          <ImageIcon class="w-8 h-8 text-cyan-400" v-if="!isProcessing" />
          <Loader2 class="w-8 h-8 animate-spin text-cyan-400" v-else />
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-cyan-400 mb-1">
            {{ isProcessing ? '正在處理圖片...' : '點擊拍攝或選擇遊戲截圖' }}
          </p>
          <p class="text-sm text-gray-400">
            支持拍照或從相冊選擇圖片
          </p>
        </div>
      </label>
    </div>

    <!-- Recognition Result Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-cyan-500">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-cyan-400">識別結果</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">OCR 識別結果</label>
            <input
              v-model="recognizedText"
              type="text"
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="識別出的文字"
            />
          </div>

          <!-- Player Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              匹配玩家
              <span class="text-xs text-gray-400">(系統已自動選擇最匹配的玩家)</span>
            </label>
            <select
              v-model="selectedPlayerId"
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">請選擇玩家</option>
              <option v-for="player in matchedPlayers" :key="player.id" :value="player.id">
                {{ player.name }} - {{ player.full_id_string }} (匹配度: {{ player.matchScore }})
              </option>
            </select>
          </div>

          <div v-if="selectedPlayer" class="bg-gray-700 p-3 rounded border border-cyan-500">
            <p class="text-sm"><strong>選擇的玩家:</strong> {{ selectedPlayer.name }}</p>
            <p class="text-sm text-gray-400">{{ selectedPlayer.full_id_string }}</p>
            <p class="text-xs text-cyan-400">伺服器: {{ selectedPlayer.servers?.name }}</p>
          </div>

          <div v-if="matchedPlayers.length === 0" class="bg-red-900/50 border border-red-500 p-3 rounded">
            <p class="text-sm text-red-400">未找到匹配的玩家，請檢查 OCR 結果或聯繫管理員添加玩家信息</p>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="closeModal"
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            取消
          </button>
          <button
            @click="saveRecord"
            :disabled="!selectedPlayerId || isSaving"
            class="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-bold py-2 px-4 rounded transition-colors"
          >
            {{ isSaving ? '保存中...' : '保存記錄' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Scan Records History -->
    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 class="text-xl font-semibold mb-4">掃描記錄歷史</h3>
      <div class="space-y-2">
        <div
          v-for="record in scanRecords"
          :key="record.id"
          class="bg-gray-700 p-4 rounded border border-gray-600"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ record.players?.name }}</p>
              <p class="text-sm text-gray-400">{{ record.players?.full_id_string }}</p>
            </div>
            <span class="text-xs text-gray-500">{{ formatDate(record.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { createWorker } from 'tesseract.js'
import { Camera, ImageIcon, Loader2, X } from 'lucide-vue-next'
import { supabase } from '../lib/supabase.js'

const fileInput = ref(null)
const isProcessing = ref(false)
const showModal = ref(false)
const recognizedText = ref('')
const selectedPlayerId = ref('')
const isSaving = ref(false)
const matchedPlayers = ref([])
const scanRecords = ref([])

let worker = null

onMounted(async () => {
  worker = await createWorker('eng')
  await loadScanRecords()
})

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isProcessing.value = true
  recognizedText.value = ''

  try {
    // Compress image if larger than 2MB
    let processedFile = file
    if (file.size > 2 * 1024 * 1024) { // 2MB
      processedFile = await compressImage(file)
    }

    const { data: { text } } = await worker.recognize(processedFile)
    recognizedText.value = text.trim()
    await findMatchingPlayers(recognizedText.value)
    showModal.value = true
  } catch (error) {
    console.error('OCR Error:', error)
    alert('識別失敗，請重試')
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
      // Calculate new dimensions (max 1920px width/height)
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

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        }))
      }, 'image/jpeg', 0.8) // 80% quality
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

    if (error) {
      console.error('Error loading players:', error)
      // For demo purposes, show a mock result
      matchedPlayers.value = [{
        id: 1,
        name: 'DemoPlayer',
        full_id_string: 'DemoPlayer[DemoServer]',
        servers: { name: 'DemoServer' },
        matchScore: 50
      }]
      selectedPlayerId.value = 1
      return
    }
  } catch (e) {
    console.error('Supabase not configured:', e)
    // For demo purposes, show a mock result
    matchedPlayers.value = [{
      id: 1,
      name: 'DemoPlayer',
      full_id_string: 'DemoPlayer[DemoServer]',
      servers: { name: 'DemoServer' },
      matchScore: 50
    }]
    selectedPlayerId.value = 1
    return
  }

  // Extract name and server from OCR text using regex
  const match = text.match(/^(.+?)\[(.+?)\]$/)
  let extractedName = ''
  let extractedServer = ''

  if (match) {
    extractedName = match[1].trim()
    extractedServer = match[2].trim()
  } else {
    // Fallback: try to extract any bracketed content
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

    // Exact name match gets highest score
    if (playerName === nameLower) score += 100
    // Partial name match
    else if (playerName.includes(nameLower) || nameLower.includes(playerName)) score += 50
    // Name contains OCR text or vice versa
    else if (nameLower && (playerName.includes(nameLower) || nameLower.includes(playerName))) score += 30

    // Exact server match
    if (playerServer === serverLower) score += 50
    // Partial server match
    else if (playerServer.includes(serverLower) || serverLower.includes(playerServer)) score += 25

    // Full ID string contains OCR text
    if (playerFullId.includes(text.toLowerCase())) score += 20

    return { ...player, matchScore: score }
  })

  // Sort by match score and filter out very low matches
  matchedPlayers.value = matches
    .filter(player => player.matchScore > 10)
    .sort((a, b) => b.matchScore - a.matchScore)

  // Auto-select the best match if score is high enough
  if (matchedPlayers.value.length > 0 && matchedPlayers.value[0].matchScore >= 50) {
    selectedPlayerId.value = matchedPlayers.value[0].id
  }
}

const selectedPlayer = computed(() => {
  return matchedPlayers.value.find(player => player.id === selectedPlayerId.value)
})

const saveRecord = async () => {
  if (!selectedPlayerId.value) {
    alert('請先選擇一個玩家')
    return
  }

  isSaving.value = true

  try {
    const { data, error } = await supabase
      .from('scan_records')
      .insert([{
        player_id: selectedPlayerId.value
      }])

    if (error) {
      console.error('Error saving record:', error)
      alert('保存記錄失敗: ' + error.message)
    } else {
      alert('記錄保存成功！')
      closeModal()
      loadScanRecords()
    }
  } catch (e) {
    console.error('Supabase not configured:', e)
    // For demo purposes, simulate success
    alert('演示模式：記錄保存成功！')
    closeModal()
  }

  isSaving.value = false
}

const loadScanRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('scan_records')
      .select(`
        *,
        players (
          name,
          full_id_string
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error loading scan records:', error)
      // For demo purposes, show mock data
      scanRecords.value = [{
        id: 1,
        player_id: 1,
        created_at: new Date().toISOString(),
        players: {
          name: 'DemoPlayer',
          full_id_string: 'DemoPlayer[DemoServer]'
        }
      }]
    } else {
      scanRecords.value = data
    }
  } catch (e) {
    console.error('Supabase not configured:', e)
    // For demo purposes, show mock data
    scanRecords.value = [{
      id: 1,
      player_id: 1,
      created_at: new Date().toISOString(),
      players: {
        name: 'DemoPlayer',
        full_id_string: 'DemoPlayer[DemoServer]'
      }
    }]
  }
}

const closeModal = () => {
  showModal.value = false
  recognizedText.value = ''
  selectedPlayerId.value = ''
  matchedPlayers.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>