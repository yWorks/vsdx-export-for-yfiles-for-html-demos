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

import '@yfiles/demo-resources/style/demo.css'

import {
  Command,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphOverviewComponent,
  HierarchicalLayout,
  LayoutExecutor,
  License,
} from '@yfiles/yfiles'
import {
  addNavigationButtons,
  bindAction,
  bindCommand,
  showApp,
  showLoadingIndicator,
} from '@yfiles/demo-resources/demo-ui/demo-app'
import licenseData from '../../license.json'
import { VsdxExport, VsdxExportConfiguration } from '@yfiles/vsdx-export'
import FastCanvasStyles, { FastEdgeStyle } from './FastCanvasStyles'
import { DemoEdgeProvider } from './DemoEdgeProvider'
import DemoStyles, {
  DemoArrow,
  DemoArrowExtension,
  DemoEdgeStyle,
  DemoEdgeStyleExtension,
  DemoGroupStyle,
  DemoGroupStyleExtension,
  DemoNodeStyle,
  DemoNodeStyleExtension,
  DemoStyleOverviewRenderer,
  initDemoStyles,
} from './resources/demo-styles'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'
import { FastCanvasNodeProvider } from './FastCanvasNodeStyleSupport'
import saveBlob from '@yfiles/demo-resources/save-blob'

// prevent tree-shaking tools from removing these styles which are used in some GraphML files
LayoutExecutor.ensure()

let graphComponent: GraphComponent = null!
let overviewComponent: GraphOverviewComponent

License.value = licenseData
// initialize the GraphComponent and GraphOverviewComponent
graphComponent = new GraphComponent('graphComponent')
overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

// initialize the graph component
initializeGraphComponent()

// bind toolbar commands
initializeUI()

// Assign the default demo styles
initDemoStyles(graphComponent.graph)

// load the first graph
readSampleGraph()

// create the input mode
initializeInputMode()

showApp(graphComponent)

function initializeGraphComponent(): void {
  // we want to enable folding for loading and showing nested graphs
  enableFolding()

  // set style for the overview control
  overviewComponent.graphOverviewRenderer = new DemoStyleOverviewRenderer()
}

/**
 * Enable folding - change the GraphComponent's graph to a managed view that provides the actual
 * collapse/expand state.
 */
function enableFolding(): void {
  // create the manager
  const foldingManager = new FoldingManager()
  // replace the displayed graph with a managed view
  graphComponent.graph = foldingManager.createFoldingView().graph
}

/**
 * Registers commands for the toolbar buttons.
 */
function initializeUI(): void {
  const graphChooserBox = document.querySelector<HTMLSelectElement>('#graph-chooser-box')!
  const sampleGraphs = [
    'computer-network',
    'family-tree',
    'hierarchy',
    'nesting',
    'social-network',
    'uml-diagram',
    'large-tree',
    'multi-style',
    'bezier-style',
    'bridges-style',
    'shape-node-style',
    'arrow-node-style',
    'rectangle-node-style',
    'group-node-style',
  ]
  sampleGraphs.forEach((graph) => {
    const option = document.createElement('option')
    option.text = graph
    option.value = graph
    graphChooserBox.add(option)
  })
  addNavigationButtons(graphChooserBox).addEventListener('change', readSampleGraph)

  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })

  document.querySelector<HTMLInputElement>('#open-button')!.addEventListener('click', async () => {
    await openGraphML(graphComponent, createGraphMLIOHandler())
  })

  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'CustomStyles.graphml', createGraphMLIOHandler())
  })

  bindCommand("button[data-command='ZoomIn']", Command.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", Command.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", Command.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", Command.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", Command.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", Command.REDO, graphComponent)

  bindCommand("button[data-command='Cut']", Command.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", Command.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", Command.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", Command.DELETE, graphComponent)

  bindCommand("button[data-command='GroupSelection']", Command.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", Command.UNGROUP_SELECTION, graphComponent)

  bindAction("button[data-command='ExportToVisio']", async () => {
    showLoadingIndicator(true)

    const config = VsdxExportConfiguration.createDefault()
    config.zoom = graphComponent.zoom

    config.masterProviders.unshift(new DemoEdgeProvider(DemoEdgeStyle, true))
    config.masterProviders.unshift(new DemoEdgeProvider(FastEdgeStyle, false))
    config.masterProviders.unshift(new FastCanvasNodeProvider())

    const fileName = graphChooserBox.options[graphChooserBox.selectedIndex].value || 'styles'

    setTimeout(async () => {
      const blob = await new VsdxExport().writeBlob(graphComponent, config)
      saveBlob(blob, fileName + '.vsdx')
      await showLoadingIndicator(false)
    })
  })

  document
    .querySelector<HTMLButtonElement>('#layout-button')!
    .addEventListener('click', async () => {
      try {
        await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), '1s')
        await graphComponent.fitGraphBounds()
      } catch (error) {
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        } else {
          throw error
        }
      }
    })
}

function initializeInputMode(): void {
  graphComponent.inputMode = new GraphEditorInputMode({
    allowUndoOperations: true,
    allowGroupingOperations: true,
    focusableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.PORT,
  })
}

/**
 * Reads the default sample graph.
 */
async function readSampleGraph(): Promise<void> {
  setUIDisabled(true)
  const graphChooserBox = document.querySelector<HTMLSelectElement>('#graph-chooser-box')!
  const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
  const fileName = `./${selectedItem}.graphml`
  // then load the graph
  graphComponent.graph.clear()
  await createGraphMLIOHandler().readFromURL(graphComponent.graph, fileName)
  // when done - fit the bounds
  graphComponent.fitGraphBounds()
  setUIDisabled(false)
}

/**
 * Helper method that creates and configures the GraphML parser.
 */
function createGraphMLIOHandler(): GraphMLIOHandler {
  const ioHandler = new GraphMLIOHandler()
  // enable support for fast style implementations
  ioHandler.addXamlNamespaceMapping('http://www.yworks.com/yfilesHTML/demos/', FastCanvasStyles)
  ioHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles,
  )

  ioHandler.addXamlNamespaceMapping('http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/2.0', {
    DemoNodeStyle,
    DemoEdgeStyle,
    DemoArrow,
    DemoGroupStyle,
    DemoNodeStyleExtension,
    DemoGroupStyleExtension,
    DemoEdgeStyleExtension,
    DemoArrowExtension,
  })
  registerMarkupExtensions(ioHandler)
  return ioHandler
}

function registerMarkupExtensions(graphMLIOHandler: GraphMLIOHandler): void {
  graphMLIOHandler.addTypeInformation(DemoNodeStyle, {
    extension: (item: DemoNodeStyle) => {
      const markupExtension = new DemoNodeStyleExtension()
      markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
      return markupExtension
    },
  })
  graphMLIOHandler.addTypeInformation(DemoNodeStyleExtension, {
    properties: {
      cssClass: { default: '', type: String },
    },
  })
  graphMLIOHandler.addTypeInformation(DemoGroupStyle, {
    extension: (item: DemoGroupStyle) => {
      const markupExtension = new DemoGroupStyleExtension()
      markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
      markupExtension.isCollapsible = item.isCollapsible
      markupExtension.solidHitTest = item.solidHitTest
      return markupExtension
    },
  })
  graphMLIOHandler.addTypeInformation(DemoGroupStyleExtension, {
    properties: {
      cssClass: { default: '', type: String },
      isCollapsible: { default: false, type: Boolean },
      solidHitTest: { default: false, type: Boolean },
    },
  })
  graphMLIOHandler.addTypeInformation(DemoEdgeStyle, {
    extension: (item: DemoEdgeStyle) => {
      const markupExtension = new DemoEdgeStyleExtension()
      markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
      markupExtension.showTargetArrows = item.showTargetArrows
      markupExtension.useMarkerArrows = item.useMarkerArrows
      return markupExtension
    },
  })
  graphMLIOHandler.addTypeInformation(DemoEdgeStyleExtension, {
    properties: {
      cssClass: { default: '', type: String },
      showTargetArrows: { default: true, type: Boolean },
      useMarkerArrows: { default: true, type: Boolean },
    },
  })
  graphMLIOHandler.addTypeInformation(DemoArrow, {
    extension: (item: DemoArrow) => {
      const markupExtension = new DemoArrowExtension()
      markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
      return markupExtension
    },
  })
  graphMLIOHandler.addTypeInformation(DemoArrowExtension, {
    properties: {
      cssClass: { default: '', type: String },
    },
  })
}

/**
 * Updates the elements of the UI's state and the input mode and checks whether the buttons should
 * be enabled or not.
 */
function setUIDisabled(disabled: boolean): void {
  document.querySelector<HTMLSelectElement>('#graph-chooser-box')!.disabled = disabled
}
