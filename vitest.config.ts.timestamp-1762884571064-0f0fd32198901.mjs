// vitest.config.ts
import { defineConfig } from "file:///E:/ideas-lab/projeto-gerador-ideias-frontend/node_modules/vitest/dist/config.js";
import react from "file:///E:/ideas-lab/projeto-gerador-ideias-frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "node:path";
var __vite_injected_original_dirname = "E:\\ideas-lab\\projeto-gerador-ideias-frontend";
var vitest_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setupTests.ts"],
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/pages/**/*.{ts,tsx}",
        "src/services/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}"
      ],
      exclude: [
        "src/main.tsx",
        "src/App.tsx",
        "src/test/**/*",
        "src/routes/**/*",
        "src/types/**/*",
        "src/constants/**/*",
        "src/**/*.d.ts",
        "src/components/Header",
        "src/components/IdeiaCard/IdeaHistoryCard.tsx",
        "src/components/StatsCard/StatsKPI.tsx",
        "src/components/Footer/AppFooter.tsx",
        "src/lib"
      ]
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"]
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXGlkZWFzLWxhYlxcXFxwcm9qZXRvLWdlcmFkb3ItaWRlaWFzLWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxpZGVhcy1sYWJcXFxccHJvamV0by1nZXJhZG9yLWlkZWlhcy1mcm9udGVuZFxcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9pZGVhcy1sYWIvcHJvamV0by1nZXJhZG9yLWlkZWlhcy1mcm9udGVuZC92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJywgXHJcbiAgICBnbG9iYWxzOiB0cnVlLCAgICAgICAgIFxyXG4gICAgc2V0dXBGaWxlczogWydzcmMvdGVzdC9zZXR1cFRlc3RzLnRzJ10sXHJcbiAgICBjb3ZlcmFnZToge1xyXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2xjb3YnXSwgXHJcbiAgICAgIHJlcG9ydHNEaXJlY3Rvcnk6ICdjb3ZlcmFnZScsIFxyXG4gICAgICBpbmNsdWRlOiBbXHJcbiAgICAgICAgJ3NyYy9jb21wb25lbnRzLyoqLyoue3RzLHRzeH0nLFxyXG4gICAgICAgICdzcmMvcGFnZXMvKiovKi57dHMsdHN4fScsXHJcbiAgICAgICAgJ3NyYy9zZXJ2aWNlcy8qKi8qLnt0cyx0c3h9JyxcclxuICAgICAgICAnc3JjL2xpYi8qKi8qLnt0cyx0c3h9JyxcclxuICAgICAgXSxcclxuICAgICAgZXhjbHVkZTogW1xyXG4gICAgICAgICdzcmMvbWFpbi50c3gnLFxyXG4gICAgICAgICdzcmMvQXBwLnRzeCcsXHJcbiAgICAgICAgJ3NyYy90ZXN0LyoqLyonLFxyXG4gICAgICAgICdzcmMvcm91dGVzLyoqLyonLFxyXG4gICAgICAgICdzcmMvdHlwZXMvKiovKicsXHJcbiAgICAgICAgJ3NyYy9jb25zdGFudHMvKiovKicsXHJcbiAgICAgICAgJ3NyYy8qKi8qLmQudHMnLFxyXG4gICAgICAgICdzcmMvY29tcG9uZW50cy9IZWFkZXInLFxyXG4gICAgICAgICdzcmMvY29tcG9uZW50cy9JZGVpYUNhcmQvSWRlYUhpc3RvcnlDYXJkLnRzeCcsXHJcbiAgICAgICAgJ3NyYy9jb21wb25lbnRzL1N0YXRzQ2FyZC9TdGF0c0tQSS50c3gnLFxyXG4gICAgICAgICdzcmMvY29tcG9uZW50cy9Gb290ZXIvQXBwRm9vdGVyLnRzeCcsXHJcbiAgICAgICAgJ3NyYy9saWInLFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3Rlc3Qsc3BlY30ue3RzLHRzeH0nXSwgXHJcbiAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcycsICdkaXN0J10sXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVSxTQUFTLG9CQUFvQjtBQUM3VixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sd0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDcEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxZQUFZLENBQUMsd0JBQXdCO0FBQUEsSUFDckMsVUFBVTtBQUFBLE1BQ1IsVUFBVSxDQUFDLFFBQVEsTUFBTTtBQUFBLE1BQ3pCLGtCQUFrQjtBQUFBLE1BQ2xCLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUMsK0JBQStCO0FBQUEsSUFDekMsU0FBUyxDQUFDLGdCQUFnQixNQUFNO0FBQUEsRUFDbEM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
