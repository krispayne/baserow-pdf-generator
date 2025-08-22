// Wrap each word into <span> element for further calculations
export const wrapWords = (element) => {
  return element.innerText
    .split(/\s/)
    .map((word) => `<span>${word}</span>`)
    .join(' ')
}

// Convert element's text into array of string with saving lines position
export const getLines = (element) => {
  const words = Array.from(element.getElementsByTagName('span'))
  const lines = []
  let lastTop = 0

  for (const word of words) {
    // If word on the same line as previous, push it there
    if (word.offsetTop === lastTop) {
      if (!lines[lines.length - 1]) {
        lines[0] = word.innerText
        continue
      }
      lines[lines.length - 1] = lines[lines.length - 1].concat(` ${word.innerText}`)
      continue
    }

    lastTop = word.offsetTop
    lines.push(word.innerText)
  }

  return lines.join('\n')
}

// Convert HEX to RGB according to pdf-lib format (unit RGB)
export const hexToRgb = (color) => {
  color = color.replace('#', '')
  const r = Number((parseInt(color.substring(0, 2), 16) / 255).toFixed(2))
  const g = Number((parseInt(color.substring(2, 4), 16) / 255).toFixed(2))
  const b = Number((parseInt(color.substring(4, 6), 16) / 255).toFixed(2))

  return { r, g, b }
}

// Helper function to detect actual date type based on content
const detectActualDateType = (value, fieldType = null) => {
  if (!value || typeof value !== 'string') return fieldType || 'date'
  
  // If the value contains 'T' and time information, it's a datetime
  if (value.includes('T') && value.match(/T\d{2}:\d{2}:\d{2}/)) {
    return 'datetime'
  }
  
  // If it's just YYYY-MM-DD format, it's a date
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return 'date'
  }
  
  // Fallback to provided field type or 'date'
  return fieldType || 'date'
}

// Format field values based on their data type
export const formatFieldValue = (value, field, options = {}) => {
  if (value === null || value === undefined) {
    return ''
  }

  // Handle arrays (multi-select, etc.)
  if (Array.isArray(value)) {
    return value.map(item => {
      // If item is an object with a value property (typical for Baserow multi-select)
      if (typeof item === 'object' && item !== null) {
        return item.value || item.name || item.label || String(item)
      }
      return String(item)
    }).join(', ')
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    // Common object properties that might contain display values
    if (value.value !== undefined) return String(value.value)
    if (value.name !== undefined) return String(value.name)
    if (value.label !== undefined) return String(value.label)
    if (value.title !== undefined) return String(value.title)
    
    // Fallback for other objects
    return JSON.stringify(value)
  }

  // Handle date/datetime fields with timezone conversion
  // Check for various date field types that Baserow might use
  const dateFieldTypes = ['date', 'datetime', 'last_modified', 'created_on']
  
  // First check: explicit field type match
  if (field && dateFieldTypes.includes(field.type)) {
    // Override field type based on actual data content
    const actualFieldType = detectActualDateType(value, field.type)
    return formatDateWithTimezone(value, actualFieldType, options.timezone)
  }
  
  // Second check: if field type is 'date' but data contains time, treat as datetime
  if (field && field.type === 'date' && typeof value === 'string' && value.includes('T')) {
    return formatDateWithTimezone(value, 'datetime', options.timezone)
  }
  
  // Fallback: if no field type but value looks like a date, try to format it
  if (typeof value === 'string' && (
    value.match(/^\d{4}-\d{2}-\d{2}$/) ||  // YYYY-MM-DD
    value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) // ISO datetime
  )) {
    const actualFieldType = detectActualDateType(value)
    return formatDateWithTimezone(value, actualFieldType, options.timezone)
  }

  // Handle primitives
  return String(value)
}

// Format dates with timezone conversion
export const formatDateWithTimezone = (dateString, fieldType, timezone = 'America/Chicago') => {
  if (!dateString) return ''
  
  try {
    // Debug logging
    console.log('Formatting date:', { dateString, fieldType, timezone })
    
    // Handle different date string formats from Baserow
    let date
    if (typeof dateString === 'string' && dateString.includes('T')) {
      // ISO datetime string (e.g., "2024-01-15T14:30:00Z" or "2024-01-15T14:30:00.000Z")
      date = new Date(dateString)
    } else if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Date-only string (e.g., "2024-01-15")
      // For date-only fields, don't apply timezone conversion to avoid day shifts
      const [year, month, day] = dateString.split('-')
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      
      // For date-only fields, return without timezone conversion
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } else {
      date = new Date(dateString)
    }
    
    // Check if it's a valid date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString)
      return String(dateString)
    }

    // Format based on field type - check for common Baserow field types
    const isDateTimeField = fieldType === 'datetime' || fieldType === 'last_modified' || fieldType === 'created_on'
    const isDateField = fieldType === 'date'
    
    if (isDateField) {
      // For date-only fields, avoid timezone conversion that might shift the day
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } else if (isDateTimeField) {
      // For datetime fields, show date and time with timezone conversion
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    // Fallback - try to detect if it looks like it has time info
    if (dateString.includes('T') || dateString.includes(':')) {
      // Looks like datetime
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } else {
      // Looks like date-only
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
    
  } catch (error) {
    console.warn('Error formatting date:', error, { dateString, fieldType })
    return String(dateString)
  }
}
