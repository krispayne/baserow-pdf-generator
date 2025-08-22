<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

const activeFieldIndex = computed(() =>
  dataStore.draggableFields.findIndex((field) => field.id === dataStore.configurableId)
)
let activeField = dataStore.draggableFields[activeFieldIndex.value]

const fontSize = ref()
const changeFontSize = (diff) => {
  fontSize.value = Number(fontSize.value) + diff
}
watch(fontSize, (newValue) => {
  dataStore.draggableFields[activeFieldIndex.value].fontSize = Number(newValue)
})

const lineHeight = ref()
const changeLineHeight = (diff) => {
  lineHeight.value = Number(lineHeight.value) + diff
}
watch(lineHeight, (newValue) => {
  dataStore.draggableFields[activeFieldIndex.value].lineHeight = Number(newValue)
})

const setInitialValues = () => {
  fontSize.value = activeField.fontSize
  lineHeight.value = activeField.lineHeight
  color.value = activeField.color
  showLabel.value = activeField.showLabel
  labelPosition.value = activeField.labelPosition
  labelFontSize.value = activeField.labelStyle?.fontSize || 12
  labelColor.value = activeField.labelStyle?.color || '#666666'
}

const color = ref()
const colorActivator = ref()
const menu = ref(false)

// Label configuration
const showLabel = ref()
const labelPosition = ref()
const labelFontSize = ref()
const labelColor = ref()
const labelColorActivator = ref()
const labelColorMenu = ref(false)

const labelPositionOptions = [
  { title: 'Above', value: 'above' },
  { title: 'Left', value: 'left' },
  { title: 'Below', value: 'below' }
]

watch(showLabel, (newValue) => {
  dataStore.draggableFields[activeFieldIndex.value].showLabel = newValue
})

watch(labelPosition, (newValue) => {
  dataStore.draggableFields[activeFieldIndex.value].labelPosition = newValue
})

watch(labelFontSize, (newValue) => {
  if (!dataStore.draggableFields[activeFieldIndex.value].labelStyle) {
    dataStore.draggableFields[activeFieldIndex.value].labelStyle = {}
  }
  dataStore.draggableFields[activeFieldIndex.value].labelStyle.fontSize = Number(newValue)
})

watch(labelColor, (newValue) => {
  if (!dataStore.draggableFields[activeFieldIndex.value].labelStyle) {
    dataStore.draggableFields[activeFieldIndex.value].labelStyle = {}
  }
  dataStore.draggableFields[activeFieldIndex.value].labelStyle.color = newValue
})

const changeLabelFontSize = (diff) => {
  labelFontSize.value = Number(labelFontSize.value) + diff
}

const toggleLabelColorMenu = () => {
  labelColorMenu.value = !labelColorMenu.value
}

const labelButtonColorStyle = computed(() => {
  return {
    backgroundColor: labelColor.value,
    cursor: 'pointer',
    height: '30px',
    width: '30px',
    borderRadius: labelColorMenu.value ? '50%' : '4px',
    transition: 'border-radius 200ms ease-in-out'
  }
})

const buttonColorStyle = computed(() => {
  return {
    backgroundColor: color.value,
    cursor: 'pointer',
    height: '30px',
    width: '30px',
    borderRadius: menu.value ? '50%' : '4px',
    transition: 'border-radius 200ms ease-in-out'
  }
})

watch(color, (newValue) => {
  dataStore.draggableFields[activeFieldIndex.value].color = newValue
})

const toggleMenu = () => {
  menu.value = !menu.value
}

watch(
  activeFieldIndex,
  () => {
    activeField = dataStore.draggableFields[activeFieldIndex.value]
    setInitialValues()
  },
  { immediate: true }
)
</script>

<template>
  <v-col>
    <!-- Field Styling Row -->
    <div class="inputs-row d-flex gc-2 mb-3">
      <v-text-field
        v-model="fontSize"
        label="Font Size"
        type="number"
        density="compact"
        dense
        outlined
        hide-spin-buttons
        hide-details
      >
        <template #prepend-inner>
          <v-btn icon variant="plain" size="x-small" @click="changeFontSize(-1)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
        <template #append-inner>
          <v-btn icon variant="plain" size="x-small" @click="changeFontSize(1)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <v-text-field
        v-model="lineHeight"
        label="Line Height"
        type="number"
        density="compact"
        dense
        outlined
        hide-spin-buttons
        hide-details
      >
        <template #prepend-inner>
          <v-btn icon variant="plain" size="x-small" @click="changeLineHeight(-1)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
        <template #append-inner>
          <v-btn icon variant="plain" size="x-small" @click="changeLineHeight(1)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <v-text-field v-model="color" density="compact" dense hide-details>
        <template v-slot:append>
          <v-menu v-model="menu" :target="colorActivator" :close-on-content-click="false">
            <template v-slot:activator>
              <div ref="colorActivator" :style="buttonColorStyle" @click="toggleMenu" />
            </template>
            <v-card>
              <v-card-text class="pa-0">
                <v-color-picker v-model="color" :modes="['rgb']" flat />
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-text-field>
    </div>

    <!-- Label Configuration -->
    <v-divider class="mb-3" />
    <div class="mb-2">
      <v-switch
        v-model="showLabel"
        label="Show Field Label"
        density="compact"
        hide-details
      />
    </div>

    <div v-if="showLabel" class="inputs-row">
      <div class="d-flex gc-2 mb-2">
        <v-select
          v-model="labelPosition"
          :items="labelPositionOptions"
          label="Label Position"
          density="compact"
          hide-details
        />
      </div>

      <div class="d-flex gc-2">
        <v-text-field
          v-model="labelFontSize"
          label="Label Font Size"
          type="number"
          density="compact"
          dense
          outlined
          hide-spin-buttons
          hide-details
        >
          <template #prepend-inner>
            <v-btn icon variant="plain" size="x-small" @click="changeLabelFontSize(-1)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </template>
          <template #append-inner>
            <v-btn icon variant="plain" size="x-small" @click="changeLabelFontSize(1)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <v-text-field v-model="labelColor" density="compact" dense hide-details>
          <template v-slot:append>
            <v-menu v-model="labelColorMenu" :target="labelColorActivator" :close-on-content-click="false">
              <template v-slot:activator>
                <div ref="labelColorActivator" :style="labelButtonColorStyle" @click="toggleLabelColorMenu" />
              </template>
              <v-card>
                <v-card-text class="pa-0">
                  <v-color-picker v-model="labelColor" :modes="['rgb']" flat />
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-text-field>
      </div>
    </div>
  </v-col>
</template>

<style>
.inputs-row > div {
  flex-grow: 1;
}
</style>
