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

import { demoApp, graph, graphComponent } from '@yfiles/demo-app/init'
import {
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  Point,
  Rect,
  Size,
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import { fun, Value, VsdxExportConfiguration, VsdxIO, VsdxPathFactory } from '@yfiles/vsdx-export'
import sampleGraphs from './SampleGraphs'
import saveBlob from '@yfiles/demo-utils/save-blob'

// initialize the demo styles
initDemoStyles(graph, { theme: 'demo-lightblue' })

// bind toolbar commands
initializeUI()

// load the first graph
readSampleGraph(sampleGraphs[0])

// create the input mode
graphComponent.inputMode = new GraphViewerInputMode()

async function runExport() {
  const fileName = 'Diagrams.vsdx'
  // A4 paper size in inches
  const pageWidth = 8.26772
  const pageHeight = 11.6929

  const config = VsdxExportConfiguration.createDefault()
  config.evaluateFormulas = true

  const vsdxIO = VsdxIO.createDefault()
  const exportGraphComponent = new GraphComponent()
  exportGraphComponent.graph.nodeDefaults = graphComponent.graph.nodeDefaults
  exportGraphComponent.graph.edgeDefaults = graphComponent.graph.edgeDefaults
  exportGraphComponent.graph.groupNodeDefaults = graphComponent.graph.groupNodeDefaults

  let page
  for (let i = 0; i < sampleGraphs.length; i++) {
    if (i % 2 === 0) {
      page = vsdxIO.vsdxPackage.pages.createPage('Page')
      page.pageWidth = pageWidth
      page.pageHeight = pageHeight
    }

    const yOffset = ((i % 2) * pageHeight) / 2

    const width = pageWidth - 1
    const height = pageHeight / 2 - 1
    const x = 0.5
    const y = pageHeight - yOffset - 0.5 - height

    const frame = page.shapes.createGroupShape()
    frame.pinX = x
    frame.pinY = y
    frame.width = width
    frame.height = height
    frame.lineColor = Value.rgb(150, 150, 150)
    frame.lineWeight = 0.05
    frame.fillPattern = Value.enum(0)
    VsdxPathFactory.rectangle(frame)

    const title = frame.shapes.createShape()
    title.width = 2
    title.height = 0.5
    title.pinX = fun`${frame.width}`
    title.pinY = 0
    title.locPinX = fun`${title.width}`
    title.locPinY = 0
    title.textWidth = fun`${title.width}`
    title.textHeight = fun`${title.height}`
    title.textPinX = fun`${title.width}`
    title.textPinY = 0
    title.textLocPinX = fun`${title.width}`
    title.textLocPinY = 0
    title.characters.create().textColor = Value.rgb(150, 150, 150)
    title.paragraphs.create().horizontalAlignment = Value.enum(2)
    title.text.addText(sampleGraphs[i].name)
    title.rightMargin = 0.2

    loadGraph(exportGraphComponent.graph, sampleGraphs[i])
    await vsdxIO.addGraph({
      graphComponent: exportGraphComponent,
      config,
      page,
      targetBounds: new Rect(x, y, width, height),
    })
  }

  const blob = await vsdxIO.writeBlob(config)
  saveBlob(blob, fileName)
}

/**
 * Registers commands for the toolbar buttons.
 */
function initializeUI() {
  demoApp.toolbar.addSeparator()
  demoApp.toolbar.addSelect(
    'Graphs',
    sampleGraphs.map((graph) => ({ value: graph, label: graph.name })),
    readSampleGraph,
  )

  demoApp.toolbar.addSeparator()
  demoApp.toolbar.addButton('Export to VSDX', runExport)
}

/**
 * Reads the default sample graph.
 */
function readSampleGraph(sample) {
  loadGraph(graphComponent.graph, sample)
  void graphComponent.fitGraphBounds()
}

function loadGraph(graph, data) {
  const graphBuilder = new GraphBuilder({
    graph,
    nodes: [
      {
        data: data.nodes,
        id: (_, i) => i,
        layout: (n) => new Rect(Point.from(n), new Size(30, 30)),
      },
    ],
    edges: [{ data: data.edges, sourceId: '0', targetId: '1' }],
  })
  graph.clear()
  graphBuilder.buildGraph()
}
