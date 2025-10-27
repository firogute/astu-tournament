// components/SearchSection.tsx
import { forwardRef } from "react";
import { Search, X, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchSectionProps {
  searchTerm: string;
  searchResults: any[];
  showSearchResults: boolean;
  onSearch: (term: string) => void;
  onClearSearch: () => void;
  onSearchResultClick: (result: any) => void;
}

const SearchSection = forwardRef<HTMLDivElement, SearchSectionProps>(
  (
    {
      searchTerm,
      searchResults,
      showSearchResults,
      onSearch,
      onClearSearch,
      onSearchResultClick,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tournaments, teams, players, matches, users..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => searchTerm && showSearchResults}
            />
            {searchTerm && (
              <X
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer hover:text-foreground"
                onClick={onClearSearch}
              />
            )}
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        {showSearchResults && searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            onResultClick={onSearchResultClick}
          />
        )}

        {showSearchResults && searchTerm && searchResults.length === 0 && (
          <NoResults searchTerm={searchTerm} />
        )}
      </div>
    );
  }
);

const SearchResults = ({ results, onResultClick }: any) => (
  <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-xl border-2 border-blue-200 animate-in fade-in-50">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Search Results</h4>
          <Badge variant="secondary" className="text-xs">
            {results.length} results
          </Badge>
        </div>
        {results.map((result: any) => (
          <SearchResultItem
            key={`${result.type}-${result.id}`}
            result={result}
            onClick={() => onResultClick(result)}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

const SearchResultItem = ({ result, onClick }: any) => (
  <div
    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-all duration-200 hover:shadow-md"
    onClick={onClick}
  >
    <result.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{result.displayName}</p>
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="outline" className="text-xs capitalize">
          {result.type}
        </Badge>
        {result.season && (
          <span className="text-xs text-muted-foreground">{result.season}</span>
        )}
        {result.status && (
          <span className="text-xs text-muted-foreground">{result.status}</span>
        )}
      </div>
    </div>
  </div>
);

const NoResults = ({ searchTerm }: { searchTerm: string }) => (
  <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl animate-in fade-in-50">
    <CardContent className="p-6 text-center">
      <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">
        No results found for "{searchTerm}"
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Try searching for tournaments, teams, players, or matches
      </p>
    </CardContent>
  </Card>
);

export default SearchSection;
