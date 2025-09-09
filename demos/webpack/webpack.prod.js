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

import path from 'path'
import OptimizerPlugin from '@yworks/optimizer/webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  target: 'es5',
  mode: 'production',
  entry: {
    app: ['./src/WebpackExportDemo.ts'],
  },
  plugins: [
    new OptimizerPlugin({
      logLevel: 'info',
      blacklist: [
        'connections',
        'convert',
        'edge',
        'serialize',
        'deserialize',
        'template',
        'visible',
        'Node',
        'render',
        'getText',
      ],
      shouldOptimize(module) {
        return (
          /[/\\]@yfiles[/\\]vsdx-export[/\\]/.test(module.resource) ||
          !/node_modules/.test(module.resource)
        )
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(import.meta.dirname, 'index.template.html'),
    }),
  ],
  output: {
    filename: '[name].[contenthash].js',
    chunkFormat: 'array-push',
  },
}
