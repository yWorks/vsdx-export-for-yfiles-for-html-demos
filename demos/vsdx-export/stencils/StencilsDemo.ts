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
import { GraphEditorInputMode, ShapeNodeStyle } from '@yfiles/yfiles'
import {
  EdgePathProcessingStep,
  LabelLayoutProcessingStep,
  LabelProcessingStep,
  LabelProvider,
  NodeLayoutProcessingStep,
  NodePortLocationProcessingStep,
  PolylineEdgeProvider,
  PortConnectionProcessingStep,
  VoidPortProvider,
  VsdxExport,
  VsdxExportConfiguration,
  VssxStencilProviderFactory,
} from '@yfiles/vsdx-export'
import saveBlob from '@yfiles/demo-utils/save-blob'

graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle()

// bind toolbar commands
initializeUI()

// load the graph
buildGraph()

// create the input mode
graphComponent.inputMode = new GraphEditorInputMode()

void graphComponent.fitGraphBounds()

/**
 * Registers commands for the toolbar buttons.
 */
function initializeUI(): void {
  demoApp.toolbar.addSeparator()
  demoApp.toolbar.addButton('Export to VSDX', runExport)
}

/**
 * Reads the default sample graph.
 */
function buildGraph(): void {
  const graph = graphComponent.graph
  const n1 = graph.createNodeAt([0, 0])
  const n2 = graph.createNodeAt([-50, 100])
  const n3 = graph.createNodeAt([50, 100])
  graph.createEdge({ source: n1, target: n2 })
  graph.createEdge({ source: n2, target: n3 })
  graph.createEdge({ source: n3, target: n1 })
}

async function runExport(): Promise<void> {
  const vsdxExport = new VsdxExport()

  const stencils = await fetch('./resources/stencils.vssx').then((r) => r.blob())

  const stencilProviderFactory = await VssxStencilProviderFactory.fromBlob(stencils)
  const stencilProvider = stencilProviderFactory.createMappedNodeProvider(
    ShapeNodeStyle,
    'NodeStencil',
  )

  const exportConfig = VsdxExportConfiguration.createEmpty()

  // the stencilProvider requires formula evaluation, which is disabled by default
  exportConfig.evaluateFormulas = true

  exportConfig.masterProviders.push(
    stencilProvider,
    new PolylineEdgeProvider(),
    new LabelProvider(),
    new VoidPortProvider(),
  )

  exportConfig.shapeProcessingSteps.push(
    new NodeLayoutProcessingStep(),
    new EdgePathProcessingStep(),
    new LabelLayoutProcessingStep(),
    new LabelProcessingStep(),
    new NodePortLocationProcessingStep(),
    new PortConnectionProcessingStep(),
  )

  const blob = await vsdxExport.writeBlob(graphComponent, exportConfig)
  saveBlob(blob, 'yfiles-diagram.vsdx')
}
