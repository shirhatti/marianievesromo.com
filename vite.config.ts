import { defineConfig, type Plugin } from 'vite'

// Inject <link rel="modulepreload"> for JS and <link rel="preload" as="style">
// for CSS so the browser fetches both in parallel with HTML parsing, breaking
// the HTML → JS → CSS critical-path chain.
function preloadPlugin(): Plugin {
  return {
    name: 'inject-preloads',
    transformIndexHtml(html) {
      // Extract hashed asset paths from the built HTML
      const jsMatch  = html.match(/src="(\/assets\/[^"]+\.js)"/)
      const cssMatch = html.match(/href="(\/assets\/[^"]+\.css)"/)
      const hints: string[] = []
      if (jsMatch)  hints.push(`<link rel="modulepreload" crossorigin href="${jsMatch[1]}">`)
      if (cssMatch) hints.push(`<link rel="preload" as="style" crossorigin href="${cssMatch[1]}">`)
      if (hints.length === 0) return html
      return html.replace(/(\s*)<\/head>/, '\n' + hints.map(h => '    ' + h).join('\n') + '\n  </head>')
    },
  }
}

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [preloadPlugin()],
})
