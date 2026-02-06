<template>
  <div class="p-4 max-w-6xl mx-auto h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-white tracking-tight">數據管理</h2>
      <div class="text-sm text-gray-400">
        <span class="text-cyan-400 font-bold">{{ servers.length }}</span> 伺服器 · 
        <span class="text-cyan-400 font-bold">{{ players.length }}</span> 玩家
      </div>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
      
      <!-- Server Management (Left Column, 4/12) -->
      <div class="lg:col-span-4 flex flex-col bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div class="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
          <h3 class="text-lg font-semibold text-gray-200 mb-3">伺服器列表</h3>
          <form @submit.prevent="addServer" class="relative">
            <input
              v-model="newServerName"
              type="text"
              placeholder="添加新伺服器..."
              required
              maxlength="4"
              class="w-full bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              :disabled="isAddingServer"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-50"
            >
              <Plus class="w-5 h-5" />
            </button>
          </form>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div
            v-for="server in servers"
            :key="server.id"
            class="group flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 p-3 rounded-xl border border-transparent hover:border-gray-700 transition-all"
          >
            <span class="font-medium text-gray-300">{{ server.name }}</span>
            <button
              @click="deleteServer(server.id)"
              class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          
          <div v-if="servers.length === 0" class="text-center py-8 text-gray-600 text-sm">
            暫無伺服器數據
          </div>
        </div>
      </div>

      <!-- Player Management (Right Column, 8/12) -->
      <div class="lg:col-span-8 flex flex-col bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div class="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
          <h3 class="text-lg font-semibold text-gray-200 mb-3">玩家列表</h3>
          <form @submit.prevent="addPlayer" class="flex gap-3">
            <div class="flex-1">
              <input
                v-model="newPlayer.name"
                type="text"
                placeholder="玩家名稱"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
              />
            </div>
            <div class="w-1/3">
              <select
                v-model="newPlayer.serverId"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all appearance-none"
              >
                <option value="" disabled>選擇伺服器</option>
                <option v-for="server in servers" :key="server.id" :value="server.id">
                  {{ server.name }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              :disabled="isAddingPlayer"
              class="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 rounded-xl transition-colors shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              {{ isAddingPlayer ? '...' : '添加' }}
            </button>
          </form>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div
              v-for="player in players"
              :key="player.id"
              class="group bg-gray-800/50 hover:bg-gray-800 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all relative"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg font-bold text-gray-400 group-hover:text-cyan-400 group-hover:from-gray-700 group-hover:to-cyan-900/30 transition-all">
                  {{ player.name.charAt(0).toUpperCase() }}
                </div>
                <button
                  @click="deletePlayer(player.id)"
                  class="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <h4 class="font-bold text-gray-200 truncate">{{ player.name }}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400 border border-gray-600">
                    {{ getServerName(player.server_id) }}
                  </span>
                  <span class="text-xs text-gray-500 truncate max-w-[100px]">
                    {{ player.full_id_string }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="players.length === 0" class="h-full flex flex-col items-center justify-center text-gray-600">
            <Users class="w-12 h-12 mb-2 opacity-20" />
            <p class="text-sm">暫無玩家數據</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Trash2, Plus, Users } from 'lucide-vue-next'
import { supabase } from '../lib/supabase.js'
import * as OpenCC from 'opencc-js'

const servers = ref([])
const players = ref([])
const isAddingServer = ref(false)
const isAddingPlayer = ref(false)
const newServerName = ref('')
const newPlayer = ref({
  name: '',
  serverId: ''
})

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' })

onMounted(() => {
  loadServers()
  loadPlayers()
})

const loadServers = async () => {
  const { data, error } = await supabase
    .from('servers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error loading servers:', error)
  } else {
    servers.value = data
  }
}

const loadPlayers = async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error loading players:', error)
  } else {
    players.value = data
  }
}

const addServer = async () => {
  const inputName = newServerName.value.trim()
  
  if (inputName.length < 2) {
    alert('伺服器名稱至少需要 2 個字符')
    return
  }

  // Convert to Traditional Chinese and take first 2 chars
  const traditionalName = converter(inputName)
  const finalName = traditionalName.substring(0, 2)

  isAddingServer.value = true
  const { error } = await supabase
    .from('servers')
    .insert([{
      name: finalName
    }])

  if (error) {
    console.error('Error adding server:', error)
    alert('添加伺服器失敗')
  } else {
    newServerName.value = ''
    loadServers()
  }
  isAddingServer.value = false
}

const addPlayer = async () => {
  if (!newPlayer.value.name.trim() || !newPlayer.value.serverId) return

  const selectedServer = servers.value.find(s => s.id == newPlayer.value.serverId)
  if (!selectedServer) return

  const fullIdString = `${newPlayer.value.name.trim()}[${selectedServer.name}]`

  isAddingPlayer.value = true
  const { error } = await supabase
    .from('players')
    .insert([{
      name: newPlayer.value.name.trim(),
      server_id: newPlayer.value.serverId,
      full_id_string: fullIdString
    }])

  if (error) {
    console.error('Error adding player:', error)
    alert('添加玩家失敗')
  } else {
    newPlayer.value = { name: '', serverId: '' }
    loadPlayers()
  }
  isAddingPlayer.value = false
}

const deleteServer = async (id) => {
  if (confirm('確定要刪除這個伺服器嗎？這將影響相關的玩家記錄。')) {
    const { error } = await supabase
      .from('servers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting server:', error)
      alert('刪除伺服器失敗')
    } else {
      loadServers()
      loadPlayers()
    }
  }
}

const deletePlayer = async (id) => {
  if (confirm('確定要刪除這個玩家嗎？')) {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting player:', error)
      alert('刪除玩家失敗')
    } else {
      loadPlayers()
    }
  }
}

const getServerName = (serverId) => {
  const server = servers.value.find(s => s.id === serverId)
  return server ? server.name : '未知'
}
</script>
