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
  alwaysSearchOnInitialLoad: true,
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
    <svg color="white" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2" /><path d="M6 8v8" /><path d="M10 4v16" /><path d="M14 6v12" /><path d="M18 9v6" /><path d="M22 12h-2" />
    </svg>
  )
}

function ResultView({ result }: { result: SearchResult }) {
  const get = (field: string) => result[field]?.raw ?? result[field]?.snippet

  return (
    <li className="sui-result">
      <div className="p-4 px-5">
        <div className="flex items-center justify-between gap-2.5 mb-2">
          <span className="text-xs font-mono font-medium text-[var(--text-accent)] opacity-90">{get("filename")}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {get("gender") && <span className="inline-flex items-center text-[0.72rem] leading-none px-2.5 py-1 bg-[var(--tag-bg)] rounded-full text-[var(--tag-text)] font-[var(--sans)] font-medium border border-[var(--border-subtle)] transition-colors">{get("gender")}</span>}
            {get("accent") && <span className="inline-flex items-center text-[0.72rem] leading-none px-2.5 py-1 bg-[var(--tag-bg)] rounded-full text-[var(--tag-text)] font-[var(--sans)] font-medium border border-[var(--border-subtle)] transition-colors">{get("accent")}</span>}
            {get("age") && <span className="inline-flex items-center text-[0.72rem] leading-none px-2.5 py-1 bg-[var(--tag-bg)] rounded-full text-[var(--tag-text)] font-[var(--sans)] font-medium border border-[var(--border-subtle)] transition-colors">{get("age")}</span>}
          </div>
        </div>
        {get("generated_text") && (
          <p className="m-0 mb-3 text-sm text-[var(--text-secondary)] leading-relaxed">{get("generated_text")}</p>
        )}
        {get("duration") != null && (
          <div className="flex justify-end">
            <span className="text-[0.68rem] font-mono font-medium px-2 py-0.5 bg-[var(--accent-subtle)] text-[var(--text-accent)] rounded-full">
              {Number(get("duration")).toFixed(3)}s
            </span>
          </div>
        )}
      </div>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center animate-[fadeIn_600ms_ease_both] [animation-delay:200ms]">
      <div className="w-14 h-14 bg-[var(--accent-subtle)] rounded-[var(--radius-lg)] flex items-center justify-center mb-5">
        <SearchIcon size={24} />
      </div>
      <h2 className="text-[1.1rem] font-semibold m-0 mb-1.5 text-[var(--text-primary)]">Search transcriptions</h2>
      <p className="text-[var(--text-tertiary)] text-[0.85rem] max-w-[320px]">
        Find Common Voice audio transcriptions by entering a query above.
      </p>
      <div className="inline-flex items-center gap-1 mt-4 text-[var(--text-tertiary)] text-xs">
        Press <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 font-[var(--sans)] text-[0.7rem] font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded shadow-[0_1px_0_var(--border)]">/</span> to focus search
      </div>
    </div>
  )
}

function App() {
  return (
    <SearchProvider config={searchConfig}>
      <div className="mx-auto max-w-[1180px] px-6 pb-16 animate-[fadeIn_500ms_ease_both]">
        <header className="pt-12 pb-8 border-b border-[var(--border)] mb-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-[var(--accent)] to-[#A78BFA] rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
              <WaveformIcon />
            </div>
            <h1 className="text-xl font-semibold m-0 tracking-[-0.04em] leading-tight">CV Transcriptions</h1>
          </div>
          <p className="text-[var(--text-tertiary)] text-[0.82rem] m-0 pl-[38px]">Search Common Voice transcriptions indexed in Elasticsearch</p>
        </header>

        <ErrorBoundary>
          <div className="flex w-full flex-row gap-4">
            <ResultsPerPage options={[10, 20, 50]} />
            <SearchBox
              inputProps={{ placeholder: "Search transcriptions..." }}
              autocompleteSuggestions={false}
              debounceLength={500}
              searchAsYouType={true}
            />
          </div>
          <WithSearch mapContextToProps={({ results }) => ({ results })}>
            {({ results }) => {
              if (!results || results.length === 0) {
                return <EmptyState />
              }
              return (
                <div className="flex gap-8 mt-6 max-md:flex-col max-md:gap-5">
                  <aside className="flex-[0_0_240px] animate-[slideInLeft_400ms_ease_both] [animation-delay:100ms] max-md:flex-none max-md:flex max-md:gap-2 max-md:overflow-x-auto max-md:pb-1">
                    <Facet field="gender" label="Gender" />
                    <Facet field="accent" label="Accent" isFilterable={true} />
                    <Facet field="age" label="Age" />
                  </aside>
                  <div className="flex-1 min-w-0 animate-[slideInRight_400ms_ease_both] [animation-delay:150ms]">
                    <PagingInfo />
                    <Results resultView={({ result }) => <ResultView result={result} />} />
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
