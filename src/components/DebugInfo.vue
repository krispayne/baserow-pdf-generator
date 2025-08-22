<template>
  <v-card class="mb-4" elevation="1" v-if="showDebug">
    <v-card-title class="text-h6">
      Debug Info
      <v-btn icon size="small" @click="showDebug = false" class="ml-auto">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div class="text-caption mb-2">Field Types:</div>
      <div v-for="field in dataStore.fields" :key="field.id" class="mb-1">
        <v-chip size="x-small" :color="getFieldColor(field.type)">
          {{ field.name }}: {{ field.type }}
        </v-chip>
      </div>
      
      <div class="text-caption mt-3 mb-2" v-if="dataStore.selectedRowId">
        Selected Row Data:
      </div>
      <div v-if="selectedRowData" class="text-mono text-caption">
        <pre>{{ JSON.stringify(selectedRowData, null, 2) }}</pre>
      </div>
    </v-card-text>
  </v-card>
  
  <v-btn 
    v-else 
    size="small" 
    variant="outlined" 
    @click="showDebug = true" 
    class="mb-2"
  >
    Show Debug Info
  </v-btn>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()
const showDebug = ref(false)

const selectedRowData = computed(() => {
  if (!dataStore.selectedRowId || !dataStore.rows.length) return null
  
  const row = dataStore.rows.find(r => r.id === dataStore.selectedRowId)
  if (!row) return null
  
  // Extract just the field data for easier reading
  const fieldData = {}
  dataStore.fields?.forEach(field => {
    fieldData[`${field.name} (${field.type})`] = row[`field_${field.id}`]
  })
  
  return fieldData
})

const getFieldColor = (fieldType) => {
  const colors = {
    'text': 'blue',
    'long_text': 'blue',
    'number': 'green',
    'date': 'orange',
    'datetime': 'red',
    'last_modified': 'purple',
    'created_on': 'purple',
    'boolean': 'teal',
    'email': 'cyan',
    'url': 'indigo'
  }
  return colors[fieldType] || 'grey'
}
</script>

<style scoped>
.text-mono {
  font-family: monospace;
  font-size: 11px;
  max-height: 200px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
}
</style>