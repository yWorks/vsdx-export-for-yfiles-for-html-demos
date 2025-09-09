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
  CustomEdgeProvider,
  type MasterProviderContext,
  Value,
  type VsdxStyleSheet,
  type ClassConstructor,
} from '@yfiles/vsdx-export'
import type { IEdge, IEdgeStyle } from '@yfiles/yfiles'

export class DemoEdgeProvider extends CustomEdgeProvider {
  private readonly arrows: boolean

  constructor(edgeStyleType: ClassConstructor<IEdgeStyle>, arrows: boolean) {
    super(edgeStyleType)
    this.arrows = arrows
  }

  protected async createStyles(
    edge: IEdge,
    context: MasterProviderContext,
  ): Promise<{
    lineStyle: VsdxStyleSheet
    fillStyle: VsdxStyleSheet
  }> {
    const styleSheet = context.styleSheets.create('CustomEdgeStyle')
    styleSheet.enableLineProps = Value.bool(true)
    styleSheet.enableFillProps = Value.bool(true)
    styleSheet.enableTextProps = Value.bool(false)

    styleSheet.lineWeight = context.coordinateConverter.scale(2)
    styleSheet.lineColor = Value.rgb(51, 102, 153)
    styleSheet.linePattern = Value.enum(1)
    styleSheet.fillPattern = Value.enum(0)

    if (this.arrows && (edge.style as { showTargetArrows?: boolean }).showTargetArrows) {
      styleSheet.beginArrow = Value.enum(0)
      styleSheet.endArrow = Value.enum(13)
      styleSheet.endArrowSize = Value.enum(0)
    }

    return { lineStyle: styleSheet, fillStyle: styleSheet }
  }
}
