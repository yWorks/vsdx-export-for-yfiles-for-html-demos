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
  Arrow,
  ArrowType,
  BaseClass,
  BridgeManager,
  type CanvasComponent,
  type Constructor,
  EdgeStyleBase,
  GeneralPath,
  IArrow,
  IBoundsProvider,
  type ICanvasContext,
  type IEdge,
  type IInputModeContext,
  INode,
  IObstacleProvider,
  type IRenderContext,
  ISvgDefsCreator,
  IVisualCreator,
  Point,
  Rect,
  SvgVisual,
  type Visual,
} from '@yfiles/yfiles'

const SVG_NS = 'http://www.w3.org/2000/svg'

export class DemoArrow extends BaseClass(IArrow, IVisualCreator, IBoundsProvider) {
  cssClass: string
  private $anchor: Point | null
  private $direction: Point | null
  private $arrowFigure: GeneralPath | null

  constructor() {
    super()

    this.cssClass = ''

    this.$anchor = null
    this.$direction = null
    this.$arrowFigure = null
  }

  get cropAtPort(): boolean {
    return false
  }

  /**
   * Returns the length of the arrow, i.e. the distance from the arrow's tip to the position where
   * the visual representation of the edge's path should begin.
   *
   * @returns
   * @see Specified by {@link IArrow#length}.
   */
  get length(): number {
    return 5.5
  }

  /**
   * Gets the cropping length associated with this instance. This value is used by edge styles to
   * let the edge appear to end shortly before its actual target.
   *
   * @returns
   * @see Specified by {@link IArrow#cropLength}.
   */
  get cropLength(): number {
    return 1
  }

  /**
   * Returns a configured visual creator.
   *
   * @returns
   */
  getVisualCreator(_edge: IEdge, _atSource: boolean, anchor: Point, direction: Point): DemoArrow {
    this.$anchor = anchor
    this.$direction = direction
    return this
  }

  /**
   * Gets an {@link IBoundsProvider} implementation that can yield this arrow's bounds if painted at
   * the given location using the given direction for the given edge.
   *
   * @param _edge The edge this arrow belongs to
   * @param _atSource Whether this will be the source arrow
   * @param anchor The anchor point for the tip of the arrow
   * @param direction The direction the arrow is pointing in
   * @returns an implementation of the {@link IBoundsProvider} interface that can subsequently be
   *   used to query the bounds. Clients will always call this method before using the
   *   implementation and may not cache the instance returned. This allows for applying the
   *   flyweight design pattern to implementations.
   * @see Specified by {@link IArrow#getBoundsProvider}.
   */
  getBoundsProvider(_edge: IEdge, _atSource: boolean, anchor: Point, direction: Point): DemoArrow {
    this.$anchor = anchor
    this.$direction = direction
    return this
  }

  /**
   * This method is called by the framework to create a visual that will be included into the
   * {@link IRenderContext}.
   *
   * @param _ctx The context that describes where the visual will be used.
   * @returns The arrow visual to include in the canvas object visual tree./>.
   * @see {@link DemoArrow#updateVisual}
   * @see Specified by {@link IVisualCreator#createVisual}.
   */
  createVisual(_ctx: IRenderContext): Visual {
    // Create a new path to draw the arrow
    if (this.$arrowFigure === null) {
      this.$arrowFigure = new GeneralPath()
      this.$arrowFigure.moveTo(new Point(-7.5, -2.5))
      this.$arrowFigure.lineTo(new Point(0, 0))
      this.$arrowFigure.lineTo(new Point(-7.5, 2.5))
      this.$arrowFigure.close()
    }

    const path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', this.$arrowFigure.createSvgPathData())
    path.setAttribute('fill', '#042d37')

    if (this.cssClass) {
      path.setAttribute('class', this.cssClass)
    }

    // Rotate arrow and move it to correct position
    path.setAttribute(
      'transform',
      'matrix(' +
        this.$direction!.x +
        ' ' +
        this.$direction!.y +
        ' ' +
        -this.$direction!.y +
        ' ' +
        this.$direction!.x +
        ' ' +
        this.$anchor!.x +
        ' ' +
        this.$anchor!.y +
        ')',
    )

    // @ts-expect-error
    path['data-renderDataCache'] = {
      direction: this.$direction,
      anchor: this.$anchor,
    }

    return new SvgVisual(path)
  }

  /**
   * This method updates or replaces a previously created visual for inclusion in the
   * {@link IRenderContext}. The {@link CanvasComponent} uses this method to give implementations a
   * chance to update an existing Visual that has previously been created by the same instance
   * during a call to {@link DemoArrow#createVisual}. Implementations may update the
   * <code>oldVisual</code> and return that same reference, or create a new visual and return the
   * new instance or <code>null</code>.
   *
   * @param _ctx The context that describes where the visual will be used in.
   * @param oldVisual The visual instance that had been returned the last time the
   *   {@link DemoArrow#createVisual} method was called on this instance.
   * @returns <code>oldVisual</code>, if this instance modified the visual, or a new visual that
   *   should replace the existing one in the canvas object visual tree.
   * @see {@link DemoArrow#createVisual}
   * @see Specified by {@link IVisualCreator#updateVisual}.
   */
  updateVisual(_ctx: IRenderContext, oldVisual: Visual): Visual {
    const path = (oldVisual as SvgVisual).svgElement
    // @ts-expect-error
    const cache = path['data-renderDataCache']

    if (this.$direction !== cache.direction || this.$anchor !== cache.anchor) {
      path.setAttribute(
        'transform',
        'matrix(' +
          this.$direction!.x +
          ' ' +
          this.$direction!.y +
          ' ' +
          -this.$direction!.y +
          ' ' +
          this.$direction!.x +
          ' ' +
          this.$anchor!.x +
          ' ' +
          this.$anchor!.y +
          ')',
      )
    }

    return oldVisual
  }

  /**
   * Returns the bounds of the arrow for the current flyweight configuration.
   *
   * @param _ctx
   * @returns
   * @see Specified by {@link IBoundsProvider#getBounds}.
   */
  getBounds(_ctx: IRenderContext): Rect {
    return new Rect(this.$anchor!.x - 8, this.$anchor!.y - 8, 32, 32)
  }
}

const isBrowserWithBadMarkerSupport = $isMicrosoftBrowser() || $detectSafariWebkit()

/**
 * Check if the used browser is IE or Edge.
 *
 * @private
 * @returns
 */
function $isMicrosoftBrowser(): boolean {
  return (
    window.navigator.userAgent.indexOf('MSIE ') > 0 ||
    !!window.navigator.userAgent.match(/Trident.*rv:11\./) ||
    !!window.navigator.userAgent.match(/Edge\/(1[2678])./i)
  )
}

/**
 * Returns version of Safari.
 *
 * @private
 * @returns Version of Safari or -1 if browser is not Safari.
 */
function $detectSafariVersion(): number {
  const ua = window.navigator.userAgent
  const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1
  if (isSafari) {
    const safariVersionMatch = ua.match(new RegExp('Version\\/(\\d*\\.\\d*)', ''))
    if (safariVersionMatch && safariVersionMatch.length > 1) {
      return parseInt(safariVersionMatch[1])
    }
  }
  return -1
}

/**
 * Returns true for browsers that use the Safari 11 Webkit engine.
 *
 * In detail, these are Safari 11 on either macOS or iOS, Chrome on iOS 11, and Firefox on iOS 11.
 *
 * @private
 * @returns
 */
function $detectSafariWebkit(): boolean {
  return $detectSafariVersion() > -1 || !!/(CriOS|FxiOS)/.exec(window.navigator.userAgent)
}

export default class DemoEdgeStyle extends EdgeStyleBase {
  cssClass: string
  private $hiddenArrow: Arrow
  private $fallbackArrow: DemoArrow
  private $markerDefsSupport: MarkerDefsSupport | null
  showTargetArrows: boolean
  useMarkerArrows: boolean

  constructor() {
    super()
    this.cssClass = ''

    this.$hiddenArrow = new Arrow({
      type: ArrowType.NONE,
      cropLength: 6,
      lengthScale: 1,
      widthScale: 1,
    })
    this.$fallbackArrow = new DemoArrow()
    this.$markerDefsSupport = null
    this.showTargetArrows = true
    this.useMarkerArrows = true
  }

  /**
   * Helper function to crop a {@link GeneralPath} by the length of the used arrow.
   *
   * @private
   * @param edge
   * @param gp
   * @returns
   */
  private $cropRenderedPath(edge: IEdge, gp: GeneralPath): GeneralPath {
    if (this.showTargetArrows) {
      const dummyArrow =
        !isBrowserWithBadMarkerSupport && this.useMarkerArrows
          ? this.$hiddenArrow
          : this.$fallbackArrow
      return this.cropPath(edge, new Arrow(ArrowType.NONE), dummyArrow, gp)!
    } else {
      return this.cropPath(edge, new Arrow(ArrowType.NONE), new Arrow(ArrowType.NONE), gp)!
    }
  }

  /**
   * Creates the visual for an edge.
   *
   * @param edge
   * @param renderContext
   * @returns
   */
  createVisual(renderContext: IRenderContext, edge: IEdge): Visual | null {
    let renderPath = this.$createPath(edge)
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.$cropRenderedPath(edge, renderPath)

    if (renderPath.size === 0) {
      return null
    }

    const gp = this.createPathWithBridges(renderPath, renderContext)

    const path = document.createElementNS(SVG_NS, 'path')
    const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#042d37')

    if (this.cssClass) {
      path.setAttribute('class', this.cssClass)
      this.$fallbackArrow.cssClass = this.cssClass + '-arrow'
    }

    if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
      this.showTargetArrows &&
        path.setAttribute(
          'marker-end',
          'url(#' + renderContext.getDefsId(this.$createMarker()) + ')',
        )

      // @ts-expect-error
      path['data-renderDataCache'] = {
        path: renderPath,
        obstacleHash: this.getObstacleHash(renderContext),
      }
      return new SvgVisual(path)
    } else {
      // use yfiles arrows instead of markers
      const container = document.createElementNS(SVG_NS, 'g')
      container.appendChild(path)
      this.showTargetArrows &&
        super.addArrows(
          renderContext,
          container,
          edge,
          gp,
          new Arrow(ArrowType.NONE),
          this.$fallbackArrow,
        )
      // @ts-expect-error
      container['data-renderDataCache'] = {
        path: renderPath,
        obstacleHash: this.getObstacleHash(renderContext),
      }
      return new SvgVisual(container)
    }
  }

  /**
   * Re-renders the edge by updating the old visual for improved performance.
   *
   * @param edge
   * @param renderContext
   * @param oldVisual
   * @returns
   */
  updateVisual(renderContext: IRenderContext, oldVisual: Visual, edge: IEdge): Visual | null {
    if (oldVisual === null) {
      return this.createVisual(renderContext, edge)
    }

    let renderPath = this.$createPath(edge)
    if (renderPath.size === 0) {
      return null
    }
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.$cropRenderedPath(edge, renderPath)
    const newObstacleHash = this.getObstacleHash(renderContext)

    // @ts-expect-error
    let path = oldVisual.svgElement
    const cache = path['data-renderDataCache']
    if (!renderPath.hasSameValue(cache['path']) || cache['obstacleHash'] !== newObstacleHash) {
      cache['path'] = renderPath
      cache['obstacleHash'] = newObstacleHash
      const gp = this.createPathWithBridges(renderPath, renderContext)
      const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
      if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
        // update code for marker arrows
        path.setAttribute('d', pathData)
        return oldVisual
      } else {
        // update code for yfiles arrows
        // @ts-expect-error
        const container = oldVisual.svgElement
        path = container.childNodes.item(0)
        path.setAttribute('d', pathData)
        while (container.childElementCount > 1) {
          container.removeChild(container.lastChild)
        }
        this.showTargetArrows &&
          super.addArrows(
            renderContext,
            container,
            edge,
            gp,
            new Arrow(ArrowType.NONE),
            this.$fallbackArrow,
          )
      }
    }
    return oldVisual
  }

  /**
   * Creates the path of an edge.
   *
   * @private
   * @param edge
   * @returns
   */
  private $createPath(edge: IEdge): GeneralPath {
    let path: GeneralPath
    // build path
    if (edge.sourcePort!.owner === edge.targetPort!.owner && edge.bends.size < 2) {
      // pretty self loops
      let outerX: number, outerY: number
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (edge.sourcePort!.owner instanceof INode) {
          outerX = edge.sourcePort!.owner.layout.x - 20
          outerY = edge.sourcePort!.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort!.locationParameter.model.getLocation(
            edge.sourcePort!,
            edge.sourcePort!.locationParameter,
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }
      path = new GeneralPath(4)
      let lastPoint = edge.sourcePort!.locationParameter.model.getLocation(
        edge.sourcePort!,
        edge.sourcePort!.locationParameter,
      )
      path.moveTo(lastPoint)
      path.lineTo(outerX, lastPoint.y)
      path.lineTo(outerX, outerY)
      lastPoint = edge.targetPort!.locationParameter.model.getLocation(
        edge.targetPort!,
        edge.targetPort!.locationParameter,
      )
      path.lineTo(lastPoint.x, outerY)
      path.lineTo(lastPoint)
    } else {
      path = super.getPath(edge)!
    }
    return path
  }

  /**
   * Gets the path of the edge cropped at the node border.
   *
   * @param edge
   * @returns
   */
  getPath(edge: IEdge): GeneralPath {
    const path = this.$createPath(edge)
    // crop path at node border
    return this.cropPath(edge, new Arrow(ArrowType.NONE), new Arrow(ArrowType.NONE), path)!
  }

  /**
   * Decorates a given path with bridges. All work is delegated to the BridgeManager's addBridges()
   * method.
   *
   * @param path The path to decorate.
   * @param context The render context.
   * @returns A copy of the given path with bridges.
   */
  createPathWithBridges(path: GeneralPath, context: IRenderContext): GeneralPath {
    const manager = this.getBridgeManager(context)
    // if there is a bridge manager registered: use it to add the bridges to the path
    return manager === null ? path : manager.addBridges(context, path, null)
  }

  /**
   * Gets an obstacle hash from the context. The obstacle hash changes if any obstacle has changed
   * on the entire graph. The hash is used to avoid re-rendering the edge if nothing has changed.
   * This method gets the obstacle hash from the BridgeManager.
   *
   * @param context The context to get the obstacle hash for.
   * @returns A hash value which represents the state of the obstacles.
   */
  getObstacleHash(context: IRenderContext): number {
    const manager = this.getBridgeManager(context)
    // get the BridgeManager from the context's lookup. If there is one
    // get a hash value which represents the current state of the obstacles.
    return manager === null ? 42 : manager.getObstacleHash(context)
  }

  /**
   * Queries the context's lookup for a BridgeManager instance.
   *
   * @param context The context to get the BridgeManager from.
   * @returns The BridgeManager for the given context instance or null
   */
  getBridgeManager(context: IRenderContext): BridgeManager | null {
    if (!context) {
      return null
    }
    const bm = context.lookup(BridgeManager)
    return bm instanceof BridgeManager ? bm : null
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   *
   * @param edge
   * @param p
   * @param inputModeContext
   * @returns
   */
  isHit(inputModeContext: IInputModeContext, p: Point, edge: IEdge): boolean {
    if (
      (edge.sourcePort!.owner === edge.targetPort!.owner && edge.bends.size < 2) ||
      super.isHit(inputModeContext, p, edge)
    ) {
      const path = this.getPath(edge)
      return path && path.pathContains(p, inputModeContext.hitTestRadius + 1)
    } else {
      return false
    }
  }

  /**
   * Determines whether the edge visual is visible or not.
   *
   * @param edge
   * @param clip
   * @param canvasContext
   * @returns
   */
  isVisible(canvasContext: ICanvasContext, clip: Rect, edge: IEdge): boolean {
    if (edge.sourcePort!.owner === edge.targetPort!.owner && edge.bends.size < 2) {
      // handle self-loops
      const spl = edge.sourcePort!.locationParameter.model.getLocation(
        edge.sourcePort!,
        edge.sourcePort!.locationParameter,
      )
      const tpl = edge.targetPort!.locationParameter.model.getLocation(
        edge.targetPort!,
        edge.targetPort!.locationParameter,
      )
      if (clip.contains(spl)) {
        return true
      }

      let outerX: number, outerY: number
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (edge.sourcePort!.owner instanceof INode) {
          outerX = edge.sourcePort!.owner.layout.x - 20
          outerY = edge.sourcePort!.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort!.locationParameter.model.getLocation(
            edge.sourcePort!,
            edge.sourcePort!.locationParameter,
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }

      // intersect the self-loop lines with the clip
      return (
        clip.intersectsLine(spl, new Point(outerX, spl.y)) ||
        clip.intersectsLine(new Point(outerX, spl.y), new Point(outerX, outerY)) ||
        clip.intersectsLine(new Point(outerX, outerY), new Point(tpl.x, outerY)) ||
        clip.intersectsLine(new Point(tpl.x, outerY), tpl)
      )
    }

    return super.isVisible(canvasContext, clip, edge)
  }

  /**
   * Helper method to let the svg marker be created by the {@link ISvgDefsCreator} implementation.
   *
   * @private
   * @returns
   */
  private $createMarker(): ISvgDefsCreator {
    if (this.$markerDefsSupport === null) {
      this.$markerDefsSupport = new MarkerDefsSupport(this.cssClass)
    }
    return this.$markerDefsSupport
  }

  /**
   * This implementation of the look up provides a custom implementation of the
   * {@link IObstacleProvider} to support bridges.
   *
   * @param edge
   * @param type
   * @returns
   * @see Overrides {@link EdgeStyleBase#lookup}
   */
  lookup(edge: IEdge, type: Constructor): object | null {
    if (type === IObstacleProvider) {
      // Provide the own IObstacleProvider implementation
      return new BasicEdgeObstacleProvider(edge)
    } else {
      return super.lookup(edge, type)
    }
  }
}

/**
 * Manages the arrow markers as svg definitions.
 */
export class MarkerDefsSupport extends BaseClass(ISvgDefsCreator) {
  cssClass: string

  constructor(cssClass = '') {
    super()
    this.cssClass = cssClass
  }

  /**
   * Creates a defs-element.
   *
   * @returns
   */
  createDefsElement(_context: ICanvasContext): SVGElement {
    const markerElement = document.createElementNS(SVG_NS, 'marker')
    markerElement.setAttribute('viewBox', '0 0 15 10')
    markerElement.setAttribute('refX', '2')
    markerElement.setAttribute('refY', '5')
    markerElement.setAttribute('markerWidth', '7')
    markerElement.setAttribute('markerHeight', '7')
    markerElement.setAttribute('orient', 'auto')

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', 'M 0 0 L 15 5 L 0 10 z')
    path.setAttribute('fill', '#042d37')

    if (this.cssClass) {
      path.setAttribute('class', this.cssClass + '-arrow')
    }

    markerElement.appendChild(path)
    return markerElement
  }

  /**
   * Checks if the specified node references the element represented by this object.
   */
  accept(_context: ICanvasContext, node: Node, id: string): boolean {
    if (node.nodeType !== 1) {
      return false
    }
    return ISvgDefsCreator.isAttributeReference(node as Element, 'marker-end', id)
  }

  /**
   * Updates the defs element with the current gradient data.
   */
  updateDefsElement(_context: ICanvasContext, _oldElement: SVGElement): void {
    // Nothing to do here
  }
}

/**
 * A custom IObstacleProvider implementation for this style.
 */
export class BasicEdgeObstacleProvider extends BaseClass(IObstacleProvider) {
  private edge: IEdge

  constructor(edge: IEdge) {
    super()
    this.edge = edge
  }

  /**
   * Returns this edge's path as obstacle.
   *
   * @returns The edge's path.
   */
  getObstacles(_canvasContext: IRenderContext): GeneralPath {
    return this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()!
  }
}

// export a default object to be able to map a namespace to this module for serialization
