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

import {
  EdgePathProcessingStep,
  NodeLayoutProcessingStep,
  NodePortLocationProcessingStep,
  PolylineEdgeProvider,
  PortConnectionProcessingStep,
  type Property,
  type Shape,
  ShapeDataProcessingStep,
  ShapeNodeProvider,
  SvgProcessingStep,
  SvgProvider,
  VoidPortProvider,
  VsdxExport,
  VsdxExportConfiguration,
} from '@yfiles/vsdx-export'
import saveBlob from '@yfiles/demo-resources/save-blob'
import { type GraphComponent, type IModelItem, INode } from '@yfiles/yfiles'
import { showLoadingIndicator } from '@yfiles/demo-resources/demo-ui/demo-app'

/**
 * Exports the graph of the given graph component to the VSDX file format and starts a download for
 * the resulting file.
 *
 * @param graphComponent The graph component with the graph to export.
 */
async function exportVsdx(graphComponent: GraphComponent): Promise<void> {
  await showLoadingIndicator(true)

  const config = VsdxExportConfiguration.createEmpty()

  config.masterProviders.push(new PolylineEdgeProvider())
  config.masterProviders.push(new ShapeNodeProvider())
  config.masterProviders.push(new SvgProvider())
  config.masterProviders.push(new VoidPortProvider())

  config.shapeProcessingSteps.push(new NodeLayoutProcessingStep())
  config.shapeProcessingSteps.push(new EdgePathProcessingStep())
  config.shapeProcessingSteps.push(new NodePortLocationProcessingStep())
  config.shapeProcessingSteps.push(new PortConnectionProcessingStep())
  config.shapeProcessingSteps.push(new SvgProcessingStep())
  config.shapeProcessingSteps.push(
    new ShapeDataProcessingStep(
      (_: Shape, item: IModelItem): boolean => item instanceof INode,
      {
        position: 'Position',
        email: 'Email',
        phone: 'Phone',
        fax: 'Fax',
        businessUnit: 'Business Unit',
        status: 'Status',
        icon: 'Icon',
      },
      (property: Property, _value: unknown, _tag: unknown) => {
        if (!property.label) {
          // store the property name also as label to allow for spaces
          property.label = property.name
        }
      },
    ),
  )

  config.zoom = graphComponent.zoom

  setTimeout(async () => {
    const blob = await new VsdxExport().writeBlob(graphComponent, config)
    saveBlob(blob, 'organization-chart.vsdx')
    await showLoadingIndicator(false)
  }, 10)
}

/**
 * Adds a new button in the demo's toolbar that starts the VSDX export.
 *
 * Of course, in your own application, you would rather use your own UI element.
 */
function addVsdxExportButton(graphComponent: GraphComponent): void {
  const button = createButtonElement()
  button.addEventListener('click', async () => {
    button.disabled = true
    try {
      await exportVsdx(graphComponent)
    } finally {
      button.disabled = false
    }
  })
}

/**
 * Creates a new button in the demo's toolbar for the VSDX export.
 */
function createButtonElement(): HTMLButtonElement {
  const exportButton = document.createElement('button')
  exportButton.setAttribute('title', 'Export To VSDX')
  exportButton.setAttribute('class', 'demo-icon-export demo-toolbar-button')

  const toolbar = document.querySelector('.demo-toolbar')!
  const separators = toolbar.querySelectorAll('.demo-separator')
  if (separators.length === 0) {
    const separator = document.createElement('span')
    separator.setAttribute('class', 'demo-separator')
    toolbar.appendChild(separator)
  } else {
    const separator = separators.item(separators.length - 1)
    if (separator.nextSibling) {
      toolbar.insertBefore(exportButton, separator.nextSibling)
    }
  }
  if (exportButton.parentNode === null) {
    toolbar.appendChild(exportButton)
  }
  return exportButton
}

export default { exportVsdx, addVsdxExportButton }
