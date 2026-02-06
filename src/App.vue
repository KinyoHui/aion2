<script setup>
import { ref } from 'vue'
import PlayerManager from './components/PlayerManager.vue'
import Scanner from './components/Scanner.vue'
import { Settings, Scan, Database } from 'lucide-vue-next'

const currentModule = ref('scanner') // 'admin' or 'scanner'
</script>

<template>
  <div class="h-[100dvh] flex flex-col text-gray-100 overflow-hidden">
    <!-- Navigation -->
    <nav class="h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          <img src="/aion2.png" alt="Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-lg font-bold tracking-wide text-white">Aion<span class="text-cyan-400">2</span></h1>
      </div>
      
      <div class="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
        <button
          @click="currentModule = 'scanner'"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
            currentModule === 'scanner'
              ? 'bg-gray-700 text-cyan-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          ]"
        >
          <Scan class="w-4 h-4" />
          <span class="hidden sm:inline">掃描</span>
        </button>
        <button
          @click="currentModule = 'admin'"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
            currentModule === 'admin'
              ? 'bg-gray-700 text-cyan-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          ]"
        >
          <Database class="w-4 h-4" />
          <span class="hidden sm:inline">數據</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 relative overflow-hidden">
      <Transition name="fade" mode="out-in">
        <Scanner v-if="currentModule === 'scanner'" />
        <PlayerManager v-else />
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
