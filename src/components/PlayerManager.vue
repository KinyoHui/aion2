<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-cyan-400 mb-6">玩家與伺服器管理</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Server Management -->
      <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 class="text-xl font-semibold mb-4 text-cyan-300">伺服器管理</h3>

        <!-- Add Server -->
        <div class="mb-4">
          <form @submit.prevent="addServer" class="flex gap-2">
            <input
              v-model="newServerName"
              type="text"
              placeholder="輸入伺服器名稱 (如: 天機)"
              required
              maxlength="4"
              class="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              :disabled="isAddingServer"
              class="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-bold px-4 py-2 rounded transition-colors"
            >
              {{ isAddingServer ? '添加中...' : '添加' }}
            </button>
          </form>
        </div>

        <!-- Server List -->
        <div class="space-y-2">
          <div
            v-for="server in servers"
            :key="server.id"
            class="flex justify-between items-center bg-gray-700 p-3 rounded"
          >
            <span>{{ server.name }}</span>
            <button
              @click="deleteServer(server.id)"
              class="text-red-400 hover:text-red-300"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Player Management -->
      <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 class="text-xl font-semibold mb-4 text-cyan-300">玩家管理</h3>

        <!-- Add Player -->
        <div class="mb-4">
          <form @submit.prevent="addPlayer" class="space-y-3">
            <div>
              <input
                v-model="newPlayer.name"
                type="text"
                placeholder="輸入玩家名稱"
                required
                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <select
                v-model="newPlayer.serverId"
                required
                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">選擇伺服器</option>
                <option v-for="server in servers" :key="server.id" :value="server.id">
                  {{ server.name }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              :disabled="isAddingPlayer"
              class="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-bold py-2 rounded transition-colors"
            >
              {{ isAddingPlayer ? '添加中...' : '添加玩家' }}
            </button>
          </form>
        </div>

        <!-- Player List -->
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="player in players"
            :key="player.id"
            class="bg-gray-700 p-3 rounded"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold">{{ player.name }}</p>
                <p class="text-sm text-gray-400">{{ player.full_id_string }}</p>
                <p class="text-xs text-gray-500">伺服器: {{ getServerName(player.server_id) }}</p>
              </div>
              <button
                @click="deletePlayer(player.id)"
                class="text-red-400 hover:text-red-300"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { supabase } from '../lib/supabase.js'

const servers = ref([])
const players = ref([])
const isAddingServer = ref(false)
const isAddingPlayer = ref(false)
const newServerName = ref('')
const newPlayer = ref({
  name: '',
  serverId: ''
})

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
    alert('載入伺服器失敗')
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
    alert('載入玩家失敗')
  } else {
    players.value = data
  }
}

const addServer = async () => {
  if (!newServerName.value.trim()) return

  isAddingServer.value = true
  const { data, error } = await supabase
    .from('servers')
    .insert([{
      name: newServerName.value.trim()
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
  const { data, error } = await supabase
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
      loadPlayers() // Reload players as server references might be affected
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