#### Examples:


__1:__ Description.

```jsx
  const DummySearcher = require('../../src/components/DummySearcher').default;
  const ListWithBarsFacetContents = require('../../src/components/ListWithBarsFacetContents').default;
  const QueryResponse = require('../../src/api/QueryResponse').default;
  const FacetFilter = require('../../src/api/FacetFilter').default;
  const sampleFacets = require('../sampleData/Facets').default;

  const qr = new QueryResponse();
  qr.totalHits = 1572;
  qr.totalTime = 583;
  qr.facets = [sampleFacets.locationFacet, sampleFacets.regionFacet, sampleFacets.dateFacet, sampleFacets.sentimentFacet];
  const facetFilters = [
    new FacetFilter("Location", "Boston", "location:Boston"),
    new FacetFilter("Language", "English", "langhage:en"),
  ];

<DummySearcher defaultQueryResponse={qr} defaultFacetFilters={facetFilters}>
  <SearchResultsFacetFilters
    showSearchBar
    placeholder="Find a value..."
    buttonLabel="Go"
    name="location"
    addFacetFilter={(bucket) => {
      alert(`Called to choose the facet value: ${bucket.displayLabel()} via the search bar`);
    }}  
  />
</DummySearcher>
```
