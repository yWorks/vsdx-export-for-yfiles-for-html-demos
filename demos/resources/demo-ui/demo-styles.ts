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
  GroupNodeLabelModel,
  GroupNodeStyle,
  IGraph,
  Insets,
  LabelStyle,
  PolylineEdgeStyle,
  ShapeNodeStyle,
} from '@yfiles/yfiles'

export function initDemoStyles(graph: IGraph): void {
  // set graph defaults
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: '#ff6c00',
    stroke: `1.5px #662b00`,
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #662b00',
    targetArrow: '#662b00 small triangle',
  })

  graph.nodeDefaults.labels.style = new LabelStyle({
    shape: 'round-rectangle',
    backgroundFill: '#ffc499',
    textFill: '#662b00',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center',
    padding: new Insets(4, 2, 4, 1),
  })

  graph.edgeDefaults.labels.style = new LabelStyle({
    shape: 'round-rectangle',
    backgroundFill: '#ffc499',
    textFill: '#662b00',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center',
    padding: new Insets(4, 2, 4, 1),
  })

  const foldingEnabled = graph.foldingView !== null
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    groupIcon: foldingEnabled ? 'minus' : 'none',
    folderIcon: foldingEnabled ? 'plus' : 'none',
    tabFill: foldingEnabled ? '#9dc6d0' : '#0b7189',
    stroke: '2px solid #0b7189',
    tabBackgroundFill: foldingEnabled ? '#0b7189' : null,
    tabPosition: foldingEnabled ? 'top-trailing' : 'top',
    tabWidth: 30,
    tabHeight: 20,
    tabPadding: 3,
    iconOffset: 2,
    iconSize: 14,
    iconForegroundFill: '#0b7189',
    hitTransparentContentArea: true,
  })

  // A label model with insets for the expand/collapse button
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()

  graph.groupNodeDefaults.labels.style = new LabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'left',
    wrapping: 'wrap-character-ellipsis',
    textFill: '#9dc6d0',
  })
}
