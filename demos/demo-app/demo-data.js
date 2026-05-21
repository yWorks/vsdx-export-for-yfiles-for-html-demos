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

export function getCategoryNames(withoutUncategorized = true) {
  const map = {
    'vsdx-export': 'VSDX Export',
  }
  if (withoutUncategorized) {
    delete map.uncategorized
  }
  return map
}

/**
 * Demos in these categories are considered to have a {@link DistributionType} of 'needs-layout'.
 */
export function getLayoutCategories() {
  return []
}

export function getDemos(excludeHiddenInGrid = false) {
  const demos = getAllEntries().filter((item) => isNotHidden(item))
  return excludeHiddenInGrid ? demos.filter((item) => !item.hiddenInGrid) : demos
}

export function getAllEntries() {
  const data = [
    {
      id: 'vsdx-basic',
      name: 'Basic VSDX Export',
      demoPath: 'vsdx-export/basic/',
      summary: `Shows how to export a yFiles diagram to a VSDX file.`,
      description: `This demo shows the essential setup for the VSDX Export.`,
      category: 'vsdx-export',
      tags: ['vsdx'],
      keywords: ['setup', 'start'],
    },
    {
      id: 'vsdx-multigraph',
      name: 'Multi-Graph Export',
      demoPath: 'vsdx-export/multigraph/',
      summary: `Shows how to export multiple graphs to a single VSDX file.`,
      description: `This demo shows how to export multiple graphs to a single VSDX file on multiple pages.`,
      category: 'vsdx-export',
      tags: ['vsdx', 'multiple-graphs'],
      keywords: ['pages', 'multiple'],
    },
    {
      id: 'vsdx-organization-chart',
      name: 'Organization Chart',
      demoPath: 'vsdx-export/orgchart/',
      summary: 'The VSDX Export integrated into an interactive viewer for organization charts.',
      description: `This is a demo of an interactive viewer for organization charts. Start with an overview of the
       company, and zoom in on employees to see how the adaptive styles gradually reveal more information.
       Hide and show departments or teams to focus on what you want to see, while yFiles' tree layout
       algorithm ensure that the chart is always properly arranged. Use the VSDX Export button to export the chart to a VSDX file.
       The business data attached to the nodes is conserved as shape data in the VSDX file.`,
      category: 'vsdx-export',
      tags: ['vsdx', 'style', 'interaction'],
      keywords: [
        'orgchart',
        'animation',
        'filtering',
        'search',
        'highlight',
        'templates',
        'print',
        'data panel',
        'structures',
        'hide',
        'detail',
        'notable style',
        'data management',
        'level of detail',
        'shape data',
        'data',
      ],
    },
    {
      id: 'vsdx-stencils',
      name: 'VSSX Stencils',
      demoPath: 'vsdx-export/stencils/',
      summary: `Shows how to apply VSSX stencils to nodes in the exported diagram.`,
      description: `This demo shows how to apply VSSX stencils to nodes in the exported diagram.
       The nodes in the exported VSDX file will use the stencil from the stencil file.`,
      category: 'vsdx-export',
      tags: ['vsdx', 'stencils', 'vssx'],
      keywords: ['masters', 'symbols'],
    },
    {
      id: 'vsdx-stylesviewer',
      name: 'Styles Viewer',
      demoPath: 'vsdx-export/stylesviewer/',
      summary: `Displays several sample graphs from various domains and exports them to VSDX.`,
      description: `Displays several sample graphs from various domains and exports them to the VSDX file format.`,
      category: 'vsdx-export',
      tags: ['vsdx', 'styles'],
      keywords: ['samples', 'viewer'],
    },
    {
      id: 'vsdx-template',
      name: 'VSDX Template',
      demoPath: 'vsdx-export/vsdxtemplate/',
      summary: `Shows how to use a VSDX file as a template for exporting a yFiles diagram.`,
      description: `This demo shows how to use a VSDX file as a template for exporting a yFiles diagram.
        The template has page with a logo in the background. The diagram is added to this page`,
      category: 'vsdx-export',
      tags: ['vsdx', 'template'],
      keywords: ['template', 'background', 'logo', 'watermark'],
    },
    {
      id: 'yfiles-demo-list',
      name: 'yFiles Demo List',
      summary: 'Lists all source code demos that are included in the yFiles package.',
      demoPath: './README.html',
      hidden: true,
    },
  ]

  return postProcess(data)
}

function postProcess(demos) {
  for (const baseDemo of demos.filter((demo) => isNotHidden(demo))) {
    const demo = baseDemo
    demo.thumbnailPath ??= `../doc/demo-thumbnails/${baseDemo.id}.webp`
    demo.demoDir ??= getDemoDir(demo)
    if (demo.linkedDemos) {
      demo.linkedDemos.name = demo.linkedDemos.type
        .replaceAll('-', ' ')
        .replace(/^./, (char) => char.toUpperCase())
    }
  }

  return demos
}

/**
 * Returns the directory of the given demo according to its demoPath property.
 */
function getDemoDir(demoEntry) {
  const demoPath = demoEntry.demoPath
  return demoPath.substring(0, demoPath.lastIndexOf('/'))
}

function isNotHidden(demo) {
  return !demo.hidden
}
