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
  CachingMasterProvider,
  type Master,
  type MasterProviderContext,
  type VsdxStyleSheet,
  Value,
  VsdxPathFactory,
} from '@yfiles/vsdx-export'
import type { INode } from '@yfiles/yfiles'
import { FastNodeStyle } from './FastCanvasStyles'

export class FastCanvasNodeProvider extends CachingMasterProvider {
  constructor() {
    super({ nodeStyleType: FastNodeStyle })
  }

  /**
   * @param _node The node.
   * @param context The context.
   * @protected
   */
  async createForNode(
    _node: INode,
    context: MasterProviderContext,
  ): Promise<{
    master: Master
    lineStyle: VsdxStyleSheet
    fillStyle: VsdxStyleSheet
    textStyle: VsdxStyleSheet
  }> {
    const master = context.masters.createMaster('FastCanvasNodeStyle')
    const shape = master.shapes.createShape()
    VsdxPathFactory.rectangle(shape)
    shape.pinX = Value.number(0)
    shape.pinY = Value.number(0)
    shape.locPinX = Value.number(0)
    shape.locPinY = Value.number(0)
    shape.width = Value.number(1)
    shape.height = Value.number(1)

    const styleSheet = context.styleSheets.create('FillOrange')
    styleSheet.enableFillProps = Value.bool(true)
    styleSheet.enableLineProps = Value.bool(true)
    styleSheet.enableTextProps = Value.bool(true)
    styleSheet.fillPattern = Value.enum(1)
    styleSheet.linePattern = Value.enum(0)
    styleSheet.fillForeground = Value.rgb(255, 140, 0)

    return { master, lineStyle: styleSheet, fillStyle: styleSheet, textStyle: styleSheet }
  }
}
