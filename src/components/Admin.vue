<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold text-cyan-400 mb-6">玩家管理</h2>

    <!-- Add Player Form -->
    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h3 class="text-xl font-semibold mb-4">添加玩家</h3>
      <form @submit.prevent="addPlayer" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">玩家名稱</label>
          <input
            v-model="newPlayer.name"
            type="text"
            required
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            placeholder="輸入玩家名稱"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">伺服器</label>
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

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">完整ID字符串</label>
          <input
            v-model="newPlayer.fullIdString"
            type="text"
            required
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            placeholder="例如: PlayerName[ServerName]"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-bold py-2 px-4 rounded transition-colors"
        >
          {{ isSubmitting ? '添加中...' : '添加玩家' }}
        </button>
      </form>
    </div>

    <!-- Players List -->
    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 class="text-xl font-semibold mb-4">玩家列表</h3>
      <div class="space-y-2">
        <div
          v-for="player in players"
          :key="player.id"
          class="bg-gray-700 p-4 rounded border border-gray-600"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ player.name }}</p>
              <p class="text-sm text-gray-400">{{ player.full_id_string }}</p>
              <p class="text-xs text-gray-500">伺服器: {{ getServerName(player.server_id) }}</p>
            </div>
            <button
              @click="deletePlayer(player.id)"
              class="text-red-400 hover:text-red-300"
            >
              <Trash2 class="w-5 h-5" />
            </button>
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
const isSubmitting = ref(false)
const newPlayer = ref({
  name: '',
  serverId: '',
  fullIdString: ''
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
  } else {
    servers.value = data
  }
}

const loadPlayers = async () => {
  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      servers (
        name
      )
    `)
    .order('name')

  if (error) {
    console.error('Error loading players:', error)
  } else {
    players.value = data
  }
}

const addPlayer = async () => {
  isSubmitting.value = true
  const { data, error } = await supabase
    .from('players')
    .insert([{
      name: newPlayer.value.name,
      server_id: newPlayer.value.serverId,
      full_id_string: newPlayer.value.fullIdString
    }])

  if (error) {
    console.error('Error adding player:', error)
    alert('添加玩家失敗')
  } else {
    newPlayer.value = { name: '', serverId: '', fullIdString: '' }
    loadPlayers()
  }
  isSubmitting.value = false
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