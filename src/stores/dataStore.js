import { defineStore } from 'pinia'
import { getRows, getFields } from '@/api/data.api'
import { defaultFieldOptions } from '@/helpers/constants'
import messages from '@/helpers/messages'
import VueCookies from 'vue-cookies'

export const useDataStore = defineStore({
  id: 'dataStore',
  state: () => ({
    fields: null,
    selectedFields: [],
    draggableFields: [],
    rows: [],
    selectedRowId: null,
    configurableField: null,
    configurableId: 0,
    templates: [],
    currentTemplateName: '',
    timezone: 'America/Chicago', // Default to CDT/CST
    loading: false,
    error: null
  }),
  actions: {
    async getFields(formData) {
      try {
        this.error = null
        this.loading = true

        const response = await getFields(formData)

        this.fields = response
      } catch (error) {
        this.error = error.message || messages.commonError
      } finally {
        this.loading = false
      }
    },
    async fetchRows(formData) {
      try {
        this.error = null
        this.loading = true

        const response = await getRows(formData)
        this.rows = response.results
      } catch (error) {
        this.error = error.message || messages.commonError
      } finally {
        this.loading = false
      }
    },
    toggleSelection(fieldId) {
      const index = this.selectedFields.indexOf(fieldId)

      if (index === -1) {
        this.selectedFields.push(fieldId)
        this.composeDraggableFields(fieldId)
      } else {
        this.selectedFields.splice(index, 1)

        // Remove item from draggableFields
        const draggableIndex = this.draggableFields.findIndex((field) => {
          return field.id === fieldId
        })
        this.draggableFields.splice(draggableIndex, 1)

        // Turn off config view if it's field was deselected
        if (fieldId === this.configurableId) {
          this.configurableId = 0
        }
      }

      // Clear current template name when making manual changes
      this.currentTemplateName = ''
    },
    composeDraggableFields(fieldId) {
      this.draggableFields.push({
        id: fieldId,
        title: this.fields.find((f) => f.id === fieldId).name,
        ...defaultFieldOptions
      })
    },
    setConfigurableId(id) {
      this.configurableId = id
    },
    setSelectedRowId(rowId) {
      this.selectedRowId = rowId
    },
    saveTemplate(name) {
      if (!name.trim()) return false
      
      const template = {
        id: Date.now(),
        name: name.trim(),
        selectedFields: [...this.selectedFields],
        draggableFields: JSON.parse(JSON.stringify(this.draggableFields)),
        createdAt: new Date().toISOString(),
        tableId: VueCookies.get('credentials')?.tableId
      }
      
      // Remove existing template with same name
      this.templates = this.templates.filter(t => t.name !== name.trim())
      
      // Add new template
      this.templates.push(template)
      
      // Save to localStorage
      this.saveTemplatesToStorage()
      
      this.currentTemplateName = name.trim()
      return true
    },
    loadTemplate(templateId) {
      const template = this.templates.find(t => t.id === templateId)
      if (!template) return false
      
      // Clear current selection
      this.selectedFields = []
      this.draggableFields = []
      this.configurableId = 0
      
      // Load template data
      this.selectedFields = [...template.selectedFields]
      this.draggableFields = JSON.parse(JSON.stringify(template.draggableFields))
      this.currentTemplateName = template.name
      
      return true
    },
    deleteTemplate(templateId) {
      this.templates = this.templates.filter(t => t.id !== templateId)
      this.saveTemplatesToStorage()
      
      // Clear current template name if it was deleted
      const deletedTemplate = this.templates.find(t => t.id === templateId)
      if (deletedTemplate && this.currentTemplateName === deletedTemplate.name) {
        this.currentTemplateName = ''
      }
    },
    loadTemplatesFromStorage() {
      try {
        const stored = localStorage.getItem('baserow-pdf-templates')
        if (stored) {
          this.templates = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Failed to load templates:', error)
        this.templates = []
      }
    },
    saveTemplatesToStorage() {
      try {
        localStorage.setItem('baserow-pdf-templates', JSON.stringify(this.templates))
      } catch (error) {
        console.error('Failed to save templates:', error)
      }
    },
    clearCurrentTemplate() {
      this.currentTemplateName = ''
    },
    setTimezone(timezone) {
      this.timezone = timezone
      // Save to localStorage
      try {
        localStorage.setItem('baserow-pdf-timezone', timezone)
      } catch (error) {
        console.error('Failed to save timezone:', error)
      }
    },
    loadTimezoneFromStorage() {
      try {
        const stored = localStorage.getItem('baserow-pdf-timezone')
        if (stored) {
          this.timezone = stored
        }
      } catch (error) {
        console.error('Failed to load timezone:', error)
      }
    }
  }
})
