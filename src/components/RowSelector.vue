<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="text-h6">Select Row</v-card-title>
    <v-card-text>
      <v-select
        v-model="dataStore.selectedRowId"
        :items="rowOptions"
        label="Choose a row to generate PDF"
        :disabled="!dataStore.rows?.length"
        :loading="dataStore.loading"
        item-title="label"
        item-value="id"
        variant="outlined"
        density="compact"
      >
        <template #no-data>
          <v-list-item>
            <v-list-item-title>
              {{ dataStore.rows?.length ? 'No rows available' : 'Load data first' }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-select>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { formatFieldValue } from '@/helpers'

const dataStore = useDataStore()

const rowOptions = computed(() => {
  if (!dataStore.rows?.length) return []
  
  return dataStore.rows.map((row, index) => {
    // Try to create a meaningful label from the row data
    const firstField = dataStore.fields?.[0]
    const rawValue = firstField ? row[`field_${firstField.id}`] : `Row ${index + 1}`
    const displayValue = firstField ? formatFieldValue(rawValue, firstField, { timezone: dataStore.timezone }) : `Row ${index + 1}`
    
    return {
      id: row.id,
      label: `${displayValue} (ID: ${row.id})`
    }
  })
})
</script>