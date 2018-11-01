
#### Examples:


__1:__ Showing how the facet search bar might look.

```jsx
  const DummySearcher = require('../../src/components/DummySearcher').default;
  const ListWithBarsFacetContents = require('../../src/components/ListWithBarsFacetContents').default;
  const QueryResponse = require('../../src/api/QueryResponse').default;
  const sampleFacets = require('../sampleData/Facets').default;

const qr = new QueryResponse();
  qr.totalHits = 1572;
  qr.totalTime = 583;
  qr.facets = [sampleFacets.locationFacet, sampleFacets.regionFacet, sampleFacets.dateFacet, sampleFacets.sentimentFacet];
  <DummySearcher defaultQueryResponse={qr}>
    <div style={{ width: '250px' }} >
      <FacetSearchBar
        showSearchBar
        placeholder="Find a value..."
        buttonLabel="Go"
        name="location"
        addFacetFilter={(bucket) => {
          alert(`Called to choose the facet value: ${bucket.displayLabel()} via the search bar`);
        }}  
      >
        <ListWithBarsFacetContents
          buckets={sampleFacets.locationFacet.buckets}
          addFacetFilter={(bucket) => {
            alert(`Called to choose the facet value: ${bucket.displayLabel()} via the facet itself`);
          }}  
          shortSize={4}
        />
      </FacetSearchBar>
    </div>
  </DummySearcher>
```
