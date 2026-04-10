import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector"
import {
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  Paging,
  ResultsPerPage,
  Facet,
  ErrorBoundary,
  WithSearch,
} from "@elastic/react-search-ui"
import type { SearchResult } from "@elastic/search-ui"
import "@elastic/react-search-ui-views/lib/styles/styles.css"
import "./App.css"

const connector = new ElasticsearchAPIConnector({
  host: `${window.location.origin}`,
  index: "cv-transcriptions",
})

const searchConfig = {
  apiConnector: connector,
  alwaysSearchOnInitialLoad: false,
  searchQuery: {
    search_fields: {
      generated_text: { weight: 3 },
    },
    result_fields: {
      filename: { raw: {} },
      generated_text: { raw: {} },
      duration: { raw: {} },
      gender: { raw: {} },
      accent: { raw: {} },
      age: { raw: {} },
    },
    disjunctiveFacets: ["gender", "accent", "age"],
    facets: {
      gender: { type: "value", size: 10 },
      accent: { type: "value", size: 20 },
      age: { type: "value", size: 10 },
    },
  },
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function WaveformIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2" /><path d="M6 8v8" /><path d="M10 4v16" /><path d="M14 6v12" /><path d="M18 9v6" /><path d="M22 12h-2" />
    </svg>
  )
}

function ResultView({ result }: { result: SearchResult }) {
  const get = (field: string) => result[field]?.raw ?? result[field]?.snippet

  return (
    <li className="sui-result">
      <div className="sui-result__body">
        <div className="result-header">
          <span className="result-filename">{get("filename")}</span>
          {get("duration") != null && (
            <span className="result-duration-badge">
              {Number(get("duration")).toFixed(1)}s
            </span>
          )}
        </div>
        {get("generated_text") && (
          <p className="result-generated">
            <span className="label">Transcription</span>
            {get("generated_text")}
          </p>
        )}
        <div className="result-meta">
          {get("gender") && <span className="tag">{get("gender")}</span>}
          {get("accent") && <span className="tag">{get("accent")}</span>}
          {get("age") && <span className="tag">{get("age")}</span>}
        </div>
      </div>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <SearchIcon size={24} />
      </div>
      <h2>Search transcriptions</h2>
      <p>
        Find Common Voice audio transcriptions by entering a query above.
      </p>
      <div className="keyboard-hint">
        Press <span className="kbd">/</span> to focus search
      </div>
    </div>
  )
}

function App() {
  return (
    <SearchProvider config={searchConfig}>
      <div className="search-app">
        <header className="search-header">
          <div className="brand">
            <div className="brand-icon">
              <WaveformIcon />
            </div>
            <h1>CV Transcriptions</h1>
          </div>
          <p className="subtitle">Search Common Voice transcriptions indexed in Elasticsearch</p>
        </header>

        <ErrorBoundary>
          <SearchBox
            inputProps={{ placeholder: "Search transcriptions..." }}
            autocompleteSuggestions={false}
          />

          <WithSearch mapContextToProps={({ results }) => ({ results })}>
            {({ results }) => {
              if (!results || results.length === 0) {
                return <EmptyState />
              }
              return (
                <div className="search-body">
                  <aside className="search-sidebar">
                    <Facet field="gender" label="Gender" />
                    <Facet field="accent" label="Accent" isFilterable={true} />
                    <Facet field="age" label="Age" />
                  </aside>
                  <div className="search-content">
                    <PagingInfo />
                    <Results resultView={({ result }) => <ResultView result={result} />} />
                    <Paging />
                    <ResultsPerPage options={[10, 20, 50]} />
                  </div>
                </div>
              )
            }}
          </WithSearch>
        </ErrorBoundary>
      </div>
    </SearchProvider>
  )
}

export default App
