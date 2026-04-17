/**
 * Open HTTPS document links in Microsoft Office desktop (Windows) or the OS default app (WPS when set as default).
 * @see https://learn.microsoft.com/office/client-developer/office-url-schemes
 */

function officeAppFromUrl(httpsUrl) {
  const path = String(httpsUrl).split('?')[0].toLowerCase()
  if (/\.(xlsx|xls|csv)(\?|$)/i.test(path)) return 'excel'
  if (/\.(pptx|ppt)(\?|$)/i.test(path)) return 'powerpoint'
  return 'word'
}

/**
 * @param {string} httpsUrl - Must be https:// and reachable by Office (SharePoint/OneDrive or signed URL).
 * @returns {string|null}
 */
export function buildMicrosoftOfficeOpenLink(httpsUrl) {
  const u = String(httpsUrl || '').trim()
  if (!u.startsWith('https://')) return null
  const app = officeAppFromUrl(u)
  return `ms-${app}:ofe|u|${encodeURIComponent(u)}`
}

export function openMicrosoftOfficeDesktop(httpsUrl) {
  const link = buildMicrosoftOfficeOpenLink(httpsUrl)
  if (!link) return false
  window.location.assign(link)
  return true
}

/**
 * Opens the URL in the default browser / handler — WPS often takes over if it owns the file type or cloud handler.
 */
export function openWithSystemDefaultApp(httpsUrl) {
  const u = String(httpsUrl || '').trim()
  if (!u.startsWith('https://')) return false
  window.open(u, '_blank', 'noopener,noreferrer')
  return true
}
