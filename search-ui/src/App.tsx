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
} from "@elastic/react-search-ui"
import type { SearchResult } from "@elastic/search-ui"
import "@elastic/react-search-ui-views/lib/styles/styles.css"
import "./App.css"

const connector = new ElasticsearchAPIConnector({
  host: window.location.origin + "/es",
  index: "cv-transcriptions",
})

const searchConfig = {
  apiConnector: connector,
  alwaysSearchOnInitialLoad: false,
  searchQuery: {
    search_fields: {
      text: { weight: 3 },
      generated_text: { weight: 2 },
    },
    result_fields: {
      text: { raw: {} },
      generated_text: { raw: {} },
      filename: { raw: {} },
      up_votes: { raw: {} },
      down_votes: { raw: {} },
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

function ResultView({ result }: { result: SearchResult }) {
  const get = (field: string) => result[field]?.raw ?? result[field]?.snippet

  return (
    <li className="sui-result">
      <div className="sui-result__body">
        <div className="result-filename">{get("filename")}</div>
        {get("text") && <p className="result-text">{get("text")}</p>}
        {get("generated_text") && (
          <p className="result-generated">
            <span className="label">ASR:</span> {get("generated_text")}
          </p>
        )}
        <div className="result-meta">
          {get("up_votes") != null && <span className="tag">+{get("up_votes")}</span>}
          {get("down_votes") != null && <span className="tag">-{get("down_votes")}</span>}
          {get("duration") != null && <span className="tag">{Number(get("duration")).toFixed(1)}s</span>}
          {get("gender") && <span className="tag">{get("gender")}</span>}
          {get("accent") && <span className="tag">{get("accent")}</span>}
          {get("age") && <span className="tag">{get("age")}</span>}
        </div>
      </div>
    </li>
  )
}

function App() {
  return (
    <SearchProvider config={searchConfig}>
      <div className="search-app">
        <header className="search-header">
          <h1>CV Transcription Search</h1>
          <p className="subtitle">
            Search Common Voice transcriptions indexed in Elasticsearch
          </p>
        </header>

        <ErrorBoundary>
          <SearchBox
            inputProps={{ placeholder: "Search transcriptions..." }}
            autocompleteSuggestions={false}
          />

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
        </ErrorBoundary>
      </div>
    </SearchProvider>
  )
}

export default App
