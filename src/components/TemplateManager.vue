<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="text-h6">Template Management</v-card-title>
    <v-card-text>
      <!-- Current Template Display -->
      <div v-if="dataStore.currentTemplateName" class="mb-3">
        <v-chip color="primary" variant="outlined">
          <v-icon start>mdi-file-document</v-icon>
          {{ dataStore.currentTemplateName }}
        </v-chip>
      </div>

      <!-- Save Template -->
      <div class="mb-4">
        <v-text-field
          v-model="templateName"
          label="Template Name"
          variant="outlined"
          density="compact"
          :disabled="!hasFields"
          @keyup.enter="saveTemplate"
        />
        <v-btn
          color="success"
          variant="outlined"
          :disabled="!templateName.trim() || !hasFields"
          @click="saveTemplate"
          class="mt-2"
        >
          <v-icon start>mdi-content-save</v-icon>
          Save Template
        </v-btn>
      </div>

      <!-- Load Template -->
      <div v-if="availableTemplates.length">
        <v-select
          v-model="selectedTemplateId"
          :items="availableTemplates"
          label="Load Template"
          variant="outlined"
          density="compact"
          item-title="label"
          item-value="id"
        />
        <div class="d-flex gap-2 mt-2">
          <v-btn
            color="primary"
            variant="outlined"
            :disabled="!selectedTemplateId"
            @click="loadTemplate"
          >
            <v-icon start>mdi-folder-open</v-icon>
            Load Template
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            :disabled="!selectedTemplateId"
            @click="deleteTemplate"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </div>
      </div>

      <div v-else class="text-grey">
        No saved templates
      </div>
    </v-card-text>
  </v-card>

  <!-- Confirmation Dialog -->
  <v-dialog v-model="confirmDialog" max-width="400">
    <v-card>
      <v-card-title>Confirm Delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete the template "{{ templateToDelete?.name }}"?
        This action cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="confirmDialog = false">Cancel</v-btn>
        <v-btn color="error" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import VueCookies from 'vue-cookies'

const dataStore = useDataStore()

const templateName = ref('')
const selectedTemplateId = ref(null)
const confirmDialog = ref(false)
const templateToDelete = ref(null)

const hasFields = computed(() => {
  return dataStore.selectedFields.length > 0
})

const availableTemplates = computed(() => {
  const currentTableId = dataStore.rows.length ? dataStore.templates.filter(t => 
    !t.tableId || t.tableId === VueCookies.get('credentials')?.tableId
  ) : dataStore.templates
  
  return currentTableId.map(template => ({
    id: template.id,
    label: `${template.name} (${new Date(template.createdAt).toLocaleDateString()})`
  }))
})

const saveTemplate = () => {
  if (templateName.value.trim() && hasFields.value) {
    const success = dataStore.saveTemplate(templateName.value)
    if (success) {
      templateName.value = ''
    }
  }
}

const loadTemplate = () => {
  if (selectedTemplateId.value) {
    dataStore.loadTemplate(selectedTemplateId.value)
    selectedTemplateId.value = null
  }
}

const deleteTemplate = () => {
  if (selectedTemplateId.value) {
    templateToDelete.value = dataStore.templates.find(t => t.id === selectedTemplateId.value)
    confirmDialog.value = true
  }
}

const confirmDelete = () => {
  if (templateToDelete.value) {
    dataStore.deleteTemplate(templateToDelete.value.id)
    selectedTemplateId.value = null
    templateToDelete.value = null
  }
  confirmDialog.value = false
}

onMounted(() => {
  dataStore.loadTemplatesFromStorage()
})
</script>