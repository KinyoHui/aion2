<script setup>
import { ref } from 'vue'
import PlayerManager from './components/PlayerManager.vue'
import Scanner from './components/Scanner.vue'
import { Settings, Scan } from 'lucide-vue-next'

const currentModule = ref('scanner') // 'admin' or 'scanner'
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white font-mono">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-cyan-500 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-cyan-400">Aion2</h1>
        <div class="flex gap-2">
          <button
            @click="currentModule = 'scanner'"
            :class="[
              'px-4 py-2 rounded transition-colors flex items-center gap-2',
              currentModule === 'scanner'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            ]"
          >
            <Scan class="w-4 h-4" />
            掃描
          </button>
          <button
            @click="currentModule = 'admin'"
            :class="[
              'px-4 py-2 rounded transition-colors flex items-center gap-2',
              currentModule === 'admin'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            ]"
          >
            <Settings class="w-4 h-4" />
            管理
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <Scanner v-if="currentModule === 'scanner'" />
      <PlayerManager v-else />
    </main>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
