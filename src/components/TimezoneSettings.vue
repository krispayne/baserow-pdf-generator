<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="text-h6">
      <v-icon start>mdi-clock-outline</v-icon>
      Timezone Settings
    </v-card-title>
    <v-card-text>
      <v-select
        v-model="dataStore.timezone"
        :items="commonTimezones"
        label="Select Timezone"
        variant="outlined"
        density="compact"
        item-title="label"
        item-value="value"
        @update:model-value="onTimezoneChange"
      >
        <template #prepend-inner>
          <v-icon>mdi-earth</v-icon>
        </template>
      </v-select>
      <v-chip size="small" color="info" variant="outlined" class="mt-2">
        Affects date/time field display in PDFs
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

const commonTimezones = [
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Alaska Time (AKT)', value: 'America/Anchorage' },
  { label: 'Hawaii Time (HST)', value: 'Pacific/Honolulu' },
  { label: 'UTC', value: 'UTC' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris (CET/CEST)', value: 'Europe/Paris' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' }
]

const onTimezoneChange = (newTimezone) => {
  dataStore.setTimezone(newTimezone)
}

onMounted(() => {
  dataStore.loadTimezoneFromStorage()
})
</script>