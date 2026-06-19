export interface CsvColumn {
  key: string
  label: string
}

export function exportToCsv(data: Record<string, unknown>[], columns: CsvColumn[], filename: string) {
  const header = columns.map((c) => `"${c.label}"`).join(",")
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key]
      const str = val == null ? "" : String(val)
      return `"${str.replace(/"/g, '""')}"`
    }).join(",")
  )
  const csv = [header, ...rows].join("\r\n")
  const bom = "\uFEFF"
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;bom" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
