<script setup>
import { ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import CanvasView from '@/views/CanvasView.vue'
import FieldsView from '@/views/FieldsView.vue'
import FieldConfigure from '@/components/FieldConfigure.vue'
import RowSelector from '@/components/RowSelector.vue'
import TemplateManager from '@/components/TemplateManager.vue'
import TimezoneSettings from '@/components/TimezoneSettings.vue'
import DebugInfo from '@/components/DebugInfo.vue'

const dataStore = useDataStore()

const canvas = ref()

const generatePdf = () => {
  canvas.value.generatePdf()
}
</script>

<template>
  <v-container>
    <v-row>
      <FieldConfigure v-if="dataStore.configurableId" />
    </v-row>
    <v-row>
      <v-col>
        <CanvasView ref="canvas" />
      </v-col>
      <v-col cols="3">
        <TimezoneSettings />
        <TemplateManager />
        <RowSelector />
        <v-btn
          class="mb-2"
          color="success"
          size="x-large"
          block
          :disabled="!dataStore.selectedFields?.length || !dataStore.selectedRowId"
          @click="generatePdf"
        >
          Generate PDF
        </v-btn>
        <FieldsView />
        <DebugInfo />
      </v-col>
    </v-row>
  </v-container>
</template>
