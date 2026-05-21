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

import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import { GraphMLIOHandler, GraphViewerInputMode } from '@yfiles/yfiles'
import { VsdxExport, VsdxExportConfiguration } from '@yfiles/vsdx-export'
import FastCanvasStyles from './FastCanvasStyles'
import saveBlob from '@yfiles/demo-utils/save-blob'
import { FastCanvasNodeProvider } from './FastCanvasNodeStyleSupport'
import { addNavigationButtons } from '@yfiles/demo-app/modern/element-utils'

// bind toolbar commands
initializeUI()

// load the first graph
void readSampleGraph('computer-network')

// create the input mode
initializeInputMode()

async function runExport(sampleName) {
  const config = VsdxExportConfiguration.createDefault()

  // add VSDX support for the fast canvas node style
  config.masterProviders.unshift(new FastCanvasNodeProvider())

  const blob = await new VsdxExport().writeBlob(graphComponent, config)
  saveBlob(blob, sampleName + '.vsdx')
}

/**
 * Registers commands for the toolbar buttons.
 */
function initializeUI() {
  const sampleGraphs = [
    'computer-network',
    'family-tree',
    'hierarchy',
    'nesting',
    'social-network',
    'uml-diagram',
    'large-tree',
    'bezier-style',
  ]

  let currentSample = sampleGraphs[0]

  demoApp.toolbar.addSeparator()
  addNavigationButtons(
    demoApp.toolbar.addSelect(
      'Select Graph',
      sampleGraphs.map((sample) => ({ value: sample, label: sample })),
      async (sampleName) => {
        currentSample = sampleName
        await readSampleGraph(sampleName)
      },
    ),
  )

  demoApp.toolbar.addSeparator()

  demoApp.toolbar.addButton('Export to VSDX', () => runExport(currentSample))
}

function initializeInputMode() {
  graphComponent.inputMode = new GraphViewerInputMode()
  graphComponent.minimumZoom = 0.1
}

/**
 * Reads the default sample graph.
 */
async function readSampleGraph(sampleName) {
  const fileName = `./resources/${sampleName}.graphml`
  // then load the graph
  graphComponent.graph.clear()
  await createGraphMLIOHandler().readFromURL(graphComponent.graph, fileName)
  // when done - fit the bounds
  void graphComponent.fitGraphBounds()
}

/**
 * Helper method that creates and configures the GraphML parser.
 */
function createGraphMLIOHandler() {
  const ioHandler = new GraphMLIOHandler()
  // enable support for fast style implementations
  ioHandler.addXamlNamespaceMapping('http://www.yworks.com/yfilesHTML/demos/', FastCanvasStyles)
  return ioHandler
}
