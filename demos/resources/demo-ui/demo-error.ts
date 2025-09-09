/**
 * @license This demo file is part of the VSDX Export for yFiles for HTML. Copyright (c)
 *   by yWorks GmbH, Vor dem Kreuzberg 28, 72070 Tuebingen, Germany. All rights reserved.
 *
 *   YFiles demo files exhibit VSDX Export for yFiles for HTML functionalities. Any redistribution of
 *   demo files in source code or binary form, with or without modification, is not permitted.
 *
 *   Owners of a valid software license for a VSDX Export for yFiles for HTML version that this demo
 *   is shipped with are allowed to use the demo source code as basis for their own VSDX Export for
 *   yFiles for HTML powered applications. Use of such programs is governed by the rights and
 *   conditions as set out in the VSDX Export for yFiles for HTML license agreement.
 *
 *   THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *   DISCLAIMED. IN NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *   GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *   ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 *   THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Exception, yfiles } from '@yfiles/yfiles'

export const INVALID_LICENSE_MESSAGE =
  'This is an expected error caused by invalid or missing license data.'

const OK_STATE = 'OK'
const ERROR_STATE = 'Error!'

/**
 * Set to <code>true</code> when the dialog is open. Prevents opening of multiple error dialogs.
 */
let errorDialogOpen = false

// configuration
const catchErrors = true

/**
 * Helper function for logging something to the console.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logError(message: any): void {
  if (typeof window.console === 'undefined') {
    // do nothing
  } else if (typeof window.console.error === 'function') {
    window.console.error(message)
  } else {
    window.console.log(message)
  }
}

/**
 * Registers an error dialog that can send error reports to yWorks.
 *
 * This function registers error handlers for errors reported to the following
 * properties<ul><li>Exception.handler</li> <li>require.onError if 'require' is defined</li>  <li>window.onerror</li>
 * </ul>
 */
export function registerErrorDialog(): void {
  if (!catchErrors) {
    return
  }

  try {
    // try to increase the stacktrace limit
    ;(window.Error as any).stackTraceLimit = 35
  } catch (e) {
    // do nothing if it didn't work
  }

  // eslint-disable-next-line
  Exception.handler = (error: any) =>
    typeof error === 'string'
      ? openErrorDialog(error, null, 0, 0, null)
      : openErrorDialog(null, null, 0, 0, error)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyWindow = window as any

  anyWindow.reportError = (error: any) => {
    logError(unwindStack(error))
    openErrorDialog(null, null, 0, 0, error)
  }

  if (anyWindow.require != null) {
    anyWindow.onError = (_error: Error) => (error: Exception | Error) => {
      logError(unwindStack(error))
      openErrorDialog(null, null, 0, 0, error)
    }
  }

  /**
   * @param message An optional error massage in case no error instance is available.
   * @param url The URL of the script where the error was raised.
   * @param lineNumber The line number where the error occurred.
   * @param columnNumber The line number where the error occurred.
   * @param error An optional Error instance.
   */
  window.onerror = (
    message: string | Event,
    url?: string,
    lineNumber?: number,
    columnNumber?: number,
    error?: Error,
  ) => {
    const cl = typeof columnNumber === 'number' ? columnNumber : 0
    const err = typeof error !== 'undefined' ? error : null
    logError(err != null ? unwindStack(err) : message)
    return openErrorDialog(message, url, lineNumber, cl, err)
  }

  window.onunhandledrejection = (e: PromiseRejectionEvent) => {
    if (e.reason instanceof Error) {
      if (e.reason.message !== INVALID_LICENSE_MESSAGE) {
        logError(unwindStack(e.reason))
        openErrorDialog(null, null, 0, 0, e.reason)
      }
    } else if (typeof e.reason === 'string') {
      logError(e.reason)
      openErrorDialog(e.reason, null, 0, 0, null)
    } else {
      const message = 'Unhandled promise rejection'
      logError(message)
      // @ts-ignore
      openErrorDialog(message, null, null, 0, 0, null)
    }
  }
}

function getInnermostError(error: Error): Error {
  let inner: any = error
  while (inner.cause instanceof Error) {
    inner = inner.cause
  }
  return inner
}

function getInnermostMessage(error: Error): string {
  const inner = getInnermostError(error)
  return `${inner.name}: ${inner.message}`
}

function unwindStack(error: {
  stacktrace?: string
  innerException?: null | Exception
  stack?: string
}): string {
  let stack = typeof error.stacktrace !== 'undefined' ? error.stacktrace : error.stack
  if (!stack || stack.length === 0) {
    stack = '<no stack available>'
  }
  if (error.innerException) {
    return `${stack}\nCaused by:\n${unwindStack(error.innerException)}`
  }
  return stack
}

/**
 * Opens an error dialog that shows information about an error and allows sending of an error report
 * to yWorks.
 *
 * @param errorMessage An optional error massage in case no Error instance is available.
 * @param url The optional URL of the script where the error was raised.
 * @param lineNumber The line number where the error occurred.
 * @param columnNumber The line number where the error occurred.
 * @param error An optional Error instance.
 */
function openErrorDialog(
  errorMessage: string | Event | null,
  url: string | null | undefined,
  lineNumber: number | undefined,
  columnNumber: number,
  error: Exception | Error | null,
): boolean {
  if (errorDialogOpen) {
    // Do nothing and return true to prevent the default action
    return true
  }
  errorDialogOpen = true

  // no automatic error reporting for GraphML parsing errors
  if (error instanceof Exception && error.message.indexOf('XML Parsing Error') === 0) {
    let errMessage =
      "File parsing failed. Maybe the provided file format was not expected or the file's integrity is corrupt."
    if (error.message) {
      errMessage += `\n${error.message}\n`
    }
    window.alert(errMessage)
    return true
  }

  let dialog: Element
  if (error && error.name === 'TypeInfoError') {
    dialog = createSimpleErrorDialog(errorMessage, url, lineNumber, columnNumber, error)
  } else {
    // @ts-ignore
    dialog = createErrorDialog(errorMessage, url, lineNumber, columnNumber, error)
  }

  document.body.appendChild(dialog)

  // Don't move the App Status before the error dialog creation. Otherwise, automatic sending will be disabled.
  // @ts-ignore
  window['data-demo-status'] = errorMessage ? `${ERROR_STATE} ${errorMessage}` : ERROR_STATE
  return true
}

/**
 * Creates a simplified error dialog that shows information about an error.
 *
 * @param errorMessage An optional error massage in case no Error instance is available.
 * @param url The URL of the script where the error was raised.
 * @param lineNumber The line number where the error occurred.
 * @param columnNumber The line number where the error occurred.
 * @param error An optional Error instance.
 */
function createSimpleErrorDialog(
  errorMessage: string | Event | null,
  url: string | undefined | null,
  lineNumber: number | undefined,
  columnNumber: number,
  error: Exception | Error,
): Element {
  const { dialogAnchor, dialogPanel, contentPanel } = createPlainDialog('Error')
  const parent = document.body

  addClass(dialogPanel, 'demo-error-dialog')
  addClass(dialogAnchor, 'demo-error-dialog-simple')

  let htmlString = ''
  if (!error) {
    htmlString = `<div>Error message: ${errorMessage}</div>`
  } else {
    const innerMessage = getInnermostMessage(error)
    if (innerMessage) {
      htmlString += `<p><strong>Error message</strong></p><pre>${innerMessage}</pre>`
    }
    const stack = encode(unwindStack(error))
    if (stack) {
      const styledStack = stack
        .replace(/at (\S+) \(/g, 'at <strong>$1</strong> (')
        .replace(/(https?:\/\/.*?)(\)|\s)/g, '<span style="color: #3982bb;">$1</span>$2')
      htmlString += `<p><strong>Stack</strong></p><pre>${styledStack}</pre>`
    }
  }
  contentPanel.innerHTML = htmlString

  const closeButton = document.createElement('button')
  closeButton.addEventListener(
    'click',
    () => {
      parent.removeChild(dialogAnchor)
      errorDialogOpen = false
    },
    false,
  )
  closeButton.textContent = 'Close'
  contentPanel.appendChild(closeButton)

  return dialogAnchor
}

/**
 * Creates an error dialog that shows information about an error and allows sending of an error
 * report to yWorks.
 *
 * @param errorMessage An optional error massage in case no Error instance is available.
 * @param url The URL of the script where the error was raised.
 * @param lineNumber The line number where the error occurred.
 * @param columnNumber The line number where the error occurred.
 * @param error An optional Error instance.
 */
function createErrorDialog(
  errorMessage: string | Event | null,
  url: string | null,
  lineNumber: number,
  columnNumber: number,
  error: Exception & {
    line?: string | null
    lineNumber?: string | null
    columnNumber?: string | null
    sourceURL?: string | null
  },
): Element {
  const actionUrl = 'https://www.yworks.com/actions/errorReportHtmlDemos'
  const { dialogAnchor, dialogPanel, contentPanel } = createPlainDialog('Report Error to yWorks')
  const parent = document.body

  addClass(dialogPanel, 'demo-error-dialog')

  const form = document.createElement('form')
  addClass(form, 'demo-properties')
  form.setAttribute('method', 'POST')
  form.setAttribute('target', '_blank')
  form.setAttribute('action', actionUrl)
  contentPanel.appendChild(form)

  // create form element
  type yFilesInfoType = { productname: string; license: any; version: string }
  const yfilesInfo = yfiles as yFilesInfoType
  addHiddenField(form, 'exact_product', yfilesInfo.productname)
  if (yfilesInfo.license && yfilesInfo.license.key) {
    addHiddenField(form, 'license_key', yfilesInfo.license.key.substr(0, 16))
    addHiddenField(form, 'license_expiry', yfilesInfo.license.expires)
  } else {
    addHiddenField(form, 'license_key', 'No License')
    addHiddenField(form, 'license_expiry', 'No License')
  }
  addHiddenField(form, 'version', yfilesInfo.version)
  const inputEmail = addFormRow(
    form,
    'email',
    "E-Mail <span class='optional'>In case we need to contact you</span>",
    'text',
    '',
    true,
  )
  const systemInfo = addFormRow(
    form,
    'system',
    'System Info',
    'textarea',
    `appVersion: ${window.navigator.appVersion}\nVendor: ${window.navigator.vendor}\nOS: ${window.navigator.platform}\nuserAgent: ${window.navigator.userAgent}`,
  )
  // @ts-ignore
  systemInfo.rows = 2
  addFormRow(form, 'url', 'URL', 'text', window.top!.location.href)
  if (!error) {
    // The error object is not available, use the provided values
    addFormRow(form, 'error_message', 'Error Message', 'text', String(errorMessage))
    addFormRow(form, 'file', 'File', 'text', String(url))
    addFormRow(form, 'error_Line', 'Line number', 'text', String(lineNumber))
    addFormRow(form, 'error_column', 'Column number', 'text', String(columnNumber))
  } else {
    tryAddFormRow(
      form,
      'error_message',
      'Original Error Message',
      'text',
      getInnermostMessage(error),
    )
    tryAddFormRow(form, 'stack', 'Stack', 'textarea', encode(unwindStack(error)))
    tryAddFormRow(
      form,
      'error_line',
      'Error Line',
      'text',
      typeof error.line !== 'undefined' ? error.line : error.lineNumber,
    )
    tryAddFormRow(form, 'error_column', 'Error Column', 'text', error.columnNumber)
    tryAddFormRow(form, 'error_source', 'Error Source', 'text', error.sourceURL)
  }

  const inputComment = addFormRow(form, 'comment', 'Additional Comments', 'textarea', '', true)

  const submitButton = document.createElement('button')
  submitButton.setAttribute('type', 'submit')
  submitButton.addEventListener(
    'click',
    () => {
      setTimeout(() => {
        parent.removeChild(dialogAnchor)
        errorDialogOpen = false
      }, 10)
    },
    false,
  )
  submitButton.textContent = 'Submit'
  form.appendChild(submitButton)

  const cancelButton = document.createElement('button')
  cancelButton.setAttribute('type', 'reset')
  cancelButton.addEventListener(
    'click',
    () => {
      parent.removeChild(dialogAnchor)
      errorDialogOpen = false
    },
    false,
  )
  cancelButton.textContent = 'Cancel'
  form.appendChild(cancelButton)

  // Submit form data automatically if url is on *.yworks.com
  if (
    new RegExp('^[^.]+(\\.yworks\\.com)+', 'i').test(window.top!.location.href) &&
    !inErrorState() &&
    window.FormData !== undefined
  ) {
    const xhr = new XMLHttpRequest()
    const formData = new FormData(form)
    formData.append('error_dialog_suppressResponse', '1')
    xhr.open('POST', actionUrl, true)
    xhr.send(formData)
    // After automatic submit, activate the submit button only if user enters custom information
    submitButton.setAttribute('type', 'button')
    inputEmail.addEventListener(
      'change',
      () => {
        submitButton.setAttribute('type', 'submit')
      },
      false,
    )
    inputComment.addEventListener(
      'change',
      () => {
        submitButton.setAttribute('type', 'submit')
      },
      false,
    )
  }

  return dialogAnchor
}

/**
 * Creates an empty general-purpose dialog with a title bar.
 *
 * @param titleText The text for the dialog title.
 */
export function createPlainDialog(titleText: string): {
  dialogAnchor: HTMLDivElement
  dialogPanel: HTMLDivElement
  title: HTMLHeadingElement
  contentPanel: HTMLDivElement
} {
  const dialogAnchor = document.createElement('div')
  addClass(dialogAnchor, 'demo-dialog-anchor')

  const dialogPanel = document.createElement('div')
  addClass(dialogPanel, 'demo-dialog')

  const title = document.createElement('h2')
  title.innerHTML = titleText

  const contentPanel = document.createElement('div')
  addClass(contentPanel, 'demo-dialog-content')

  dialogAnchor.appendChild(dialogPanel)
  dialogPanel.appendChild(title)
  dialogPanel.appendChild(contentPanel)

  return {
    dialogAnchor,
    dialogPanel,
    title,
    contentPanel,
  }
}

function inErrorState(): boolean {
  return (
    // @ts-ignore
    typeof window['data-demo-status'] === 'string' &&
    // @ts-ignore
    window['data-demo-status'].indexOf(OK_STATE, 0) !== 0
  )
}

function encode(value: string | null): string | null {
  return typeof value === 'string'
    ? value.replace(new RegExp('<', 'g'), '[').replace(new RegExp('>', 'g'), ']')
    : value
}

function tryAddFormRow(
  form: Element,
  id: string,
  label: string,
  type: string,
  value?: string | null,
  editable?: boolean,
): Element | null {
  return value ? addFormRow(form, id, label, type, value, editable) : null
}

function addFormRow(
  form: Element,
  id: string,
  label: string,
  type: string,
  value: string,
  editable?: boolean,
): HTMLInputElement | HTMLTextAreaElement {
  const labelElement = document.createElement('label')
  labelElement.setAttribute('for', `error_dialog_${id}`)
  labelElement.innerHTML = label
  let input: HTMLTextAreaElement | HTMLInputElement
  if (type === 'textarea') {
    const textArea = document.createElement('textarea')
    textArea.rows = 3
    textArea.value = value
    input = textArea
  } else {
    input = document.createElement('input')
    input.setAttribute('type', type)
    input.setAttribute('value', value)
  }
  input.setAttribute('id', `error_dialog_${id}`)
  input.setAttribute('name', `error_dialog_${id}`)

  if (!editable) {
    input.setAttribute('readonly', 'true')
  }

  form.appendChild(labelElement)
  form.appendChild(input)
  return input
}

function addHiddenField(form: Element, id: string, value: string): Element {
  const input = document.createElement('input')
  input.setAttribute('type', 'hidden')
  input.setAttribute('value', value)
  input.setAttribute('id', `error_dialog_${id}`)
  input.setAttribute('name', `error_dialog_${id}`)
  form.appendChild(input)
  return input
}

function addClass(e: Element, className: string): Element {
  const classes = e.getAttribute('class')
  if (classes === null || classes === '') {
    e.setAttribute('class', className)
  } else if (!hasClass(e, className)) {
    e.setAttribute('class', `${classes} ${className}`)
  }
  return e
}

function hasClass(e: Element, className: string): boolean {
  const classes = e.getAttribute('class')!
  const r = new RegExp(`\\b${className}\\b`, '')
  return r.test(classes)
}
