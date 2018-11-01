#### Examples:


__1:__ Showing insights for four different facets with different display types.

```jsx
  const DummySearcher = require('../../src/components/DummySearcher').default;
  const QueryResponse = require('../../src/api/QueryResponse').default;
  const sampleFacets = require('../sampleData/Facets').default;

const qr = new QueryResponse();
  qr.totalHits = 1572;
  qr.totalTime = 583;
  qr.facets = [sampleFacets.locationFacet, sampleFacets.regionFacet, sampleFacets.dateFacet, sampleFacets.sentimentFacet];
  <DummySearcher defaultQueryResponse={qr}>
    <FacetInsights
      pieChartFacets="region"
      timeSeriesFacets="date"
      barListFacets="location"
      sentimentFacets="sentiment"
    />
  </DummySearcher>
```
