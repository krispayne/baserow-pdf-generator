<script setup>
import { ref, computed, reactive, getCurrentInstance } from 'vue'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import download from 'downloadjs'
import { useDataStore } from '@/stores/dataStore'
import { wrapWords, getLines, hexToRgb, formatFieldValue } from '@/helpers'
import { META_APPLICATION, META_PRODUCER, META_CREATOR } from '@/helpers/constants'
import messages from '@/helpers/messages'

import DraggableItem from '@/components/DraggableItem.vue'

const dataStore = useDataStore()
const { proxy } = getCurrentInstance()

const selectedFields = computed(() => dataStore.draggableFields)

const updateField = async (index, updatedField) => {
  await dataStore.draggableFields.splice(index, 1, updatedField)
}

const snackbar = reactive({
  isShown: false,
  text: ''
})

const hidden = ref()
const generatePdf = async () => {
  if (!selectedFields.value.length) {
    snackbar.text = messages.emptyCanvas
    snackbar.isShown = true
    return
  }

  if (!dataStore.rows.length) {
    await dataStore.fetchRows()
  }

  const rows = dataStore.rows

  if (!rows?.length) {
    snackbar.text = messages.noRows
    snackbar.isShown = true
    return
  }

  if (!dataStore.selectedRowId) {
    snackbar.text = 'Please select a row to generate PDF'
    snackbar.isShown = true
    return
  }

  const selectedRow = rows.find(row => row.id === dataStore.selectedRowId)
  
  if (!selectedRow) {
    snackbar.text = 'Selected row not found'
    snackbar.isShown = true
    return
  }

  const row = selectedRow
  
  // Create PDF for selected row
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Courier)
  const page = pdfDoc.addPage([612, 792]) // US Letter size (8.5" x 11")
  pdfDoc.setCreator(META_APPLICATION)
  pdfDoc.setProducer(META_PRODUCER)
  pdfDoc.setAuthor(META_CREATOR)

  selectedFields.value.forEach(async (field) => {
    const { x, y, width, fontSize, lineHeight, color, showLabel, labelPosition, labelStyle } = field
    const { height } = page.getSize()

    const rawValue = row['field_' + field.id]
    const fieldInfo = dataStore.fields?.find(f => f.id === field.id)
    const rowText = formatFieldValue(rawValue, fieldInfo, { timezone: dataStore.timezone })
    
    // Calculate positions for label and value based on label position
    let labelY = y
    let valueY = y
    let labelX = x
    let valueX = x
    
    if (showLabel && fieldInfo) {
      const labelFontSize = labelStyle?.fontSize || 12
      const labelText = fieldInfo.name
      
      switch (labelPosition) {
        case 'above':
          labelY = y
          valueY = y + labelFontSize + 4 // 4px spacing
          break
        case 'below':
          labelY = y + fontSize + lineHeight + 4 // After value text
          valueY = y
          break
        case 'left':
          labelX = x
          valueX = x + 80 // Fixed spacing, could be made configurable
          labelY = y
          valueY = y
          break
      }
      
      // Render label
      const labelColor = hexToRgb(labelStyle?.color || '#666666')
      page.drawText(labelText + (labelPosition === 'left' ? ':' : ''), {
        x: labelX,
        y: height - labelY - labelFontSize + labelFontSize * 0.18,
        size: labelFontSize,
        font,
        color: rgb(labelColor.r, labelColor.g, labelColor.b)
      })
    }

    // Emulate htmlElement to calculate block's height and split text into rows
    const textElement = document.createElement('p')

    const coefficient = 0.18 // a "magic" number, seems like a bug in pdf-lib ¯\_(ツ)_/¯

    textElement.style.fontFamily = 'Courier'
    textElement.style.display = 'inline-block'
    textElement.style.width = width + 'px'
    textElement.style.fontSize = fontSize + 'px'
    textElement.style.lineHeight = lineHeight + 'px'
    textElement.textContent = rowText

    hidden.value.append(textElement)
    textElement.innerHTML = wrapWords(textElement)

    const textLines = getLines(textElement)
    const convertedColor = hexToRgb(color)

    // Render field value using calculated position
    page.drawText(textLines, {
      x: valueX,
      y: height - valueY - fontSize + fontSize * coefficient,
      lineHeight: lineHeight - lineHeight * coefficient,
      size: fontSize,
      font,
      color: rgb(convertedColor.r, convertedColor.g, convertedColor.b)
    })

    // Clear hidden block with temporary text
    hidden.value.textContent = ''
  })

  const pdfBytes = await pdfDoc.save()

  download(pdfBytes, `Baserow_${proxy.$cookies.get('credentials').tableId}_${row.id}.pdf`)
}

defineExpose({ generatePdf })
</script>

<template>
  <div ref="hidden" class="hidden"></div>
  <div class="canvas bg-grey-lighten-2">
    <v-responsive
      class="canvas__inner"
      :style="{
        backgroundSize: '20px 20px, 20px 20px'
      }"
      :aspect-ratio="612 / 792"
    >
      <DraggableItem
        v-for="(field, index) in selectedFields"
        :key="index"
        :index="index"
        :options="field"
        :updateField="updateField"
      />
    </v-responsive>
  </div>
  <v-snackbar v-model="snackbar.isShown" color="warning">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<style>
@import 'vue-draggable-resizable/style.css';

.canvas {
  height: 792px; /* US Letter height (11") */
  width: 612px; /* US Letter width (8.5") */
  margin: auto;
}

.canvas__inner {
  font-family: Courier;
  background: linear-gradient(-90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
}

.draggable {
  cursor: grab;
}

.hidden {
  position: absolute;
  top: -9999px;
  left: -9999px;
}
</style>
