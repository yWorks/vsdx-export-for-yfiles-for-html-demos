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

import '@yfiles/yfiles/yfiles.css'
import '@yfiles/demo-resources/style/demo.css'

import {
  Command,
  GraphComponent,
  GraphViewerInputMode,
  type IGraph,
  Insets,
  License,
  PolylineEdgeStyle,
} from '@yfiles/yfiles'
import {
  bindAction,
  bindCommand,
  showApp,
  showLoadingIndicator,
} from '@yfiles/demo-resources/demo-ui/demo-app'
import { initDemoStyles } from '@yfiles/demo-resources/demo-ui/demo-styles'
import licenseData from '../../license.json'
import { VsdxExportConfiguration, VsdxIO } from '@yfiles/vsdx-export'
import saveBlob from '@yfiles/demo-resources/save-blob'

let graphComponent: GraphComponent = null!

License.value = licenseData
// initialize the GraphComponent and GraphOverviewComponent
graphComponent = new GraphComponent('graphComponent')

// bind toolbar commands
initializeUI()

// Assign the default demo styles
initDemoStyles(graphComponent.graph)

// load the first graph
createSampleGraph(graphComponent.graph)

// create the input mode
graphComponent.inputMode = new GraphViewerInputMode()

void graphComponent.fitGraphBounds()

showApp(graphComponent)

async function runExport(): Promise<void> {
  const fileName = 'Diagram.vsdx'

  // load the template file
  const template = await fetch('/template.vsdx').then((r) => r.blob())
  const vsdxIO = await VsdxIO.fromBlob(template)

  // create a configuration
  const config = VsdxExportConfiguration.createDefault()
  config.margins = new Insets(200)

  // add the yFiles diagram
  const page = vsdxIO.vsdxPackage.pages.get(1)
  await vsdxIO.addGraph(graphComponent!, config, page)

  // save the created VSDX file
  const blob = await vsdxIO.writeBlob(config)
  saveBlob(blob, fileName)
}

/**
 * Registers commands for the toolbar buttons.
 */
function initializeUI(): void {
  bindAction("button[data-command='ExportToVisio']", async () => {
    await showLoadingIndicator(true)

    setTimeout(async () => {
      await runExport()
      await showLoadingIndicator(false)
    })
  })

  bindCommand("button[data-command='ZoomIn']", Command.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", Command.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", Command.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", Command.ZOOM, graphComponent, 1.0)
}

/**
 * Creates the sample graph
 */
function createSampleGraph(graph: IGraph): void {
  graph.edgeDefaults.style = new PolylineEdgeStyle()
  const n1 = graph.createNodeAt({ location: [0, 0], labels: ['Node 1'] })
  const n2 = graph.createNodeAt({ location: [-50, 100], labels: ['Node 2'] })
  const n3 = graph.createNodeAt({ location: [50, 100], labels: ['Node 3'] })
  graph.createEdge({ source: n1, target: n2 })
  graph.createEdge({ source: n2, target: n3 })
  graph.createEdge({ source: n3, target: n1 })
}
