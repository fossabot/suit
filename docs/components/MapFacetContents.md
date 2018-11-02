#### Examples:


__1:__ A map-based facet filter. To use this, you'll need to edit the source code (click the "View Code" link below) and add your Mapbox API key.

```jsx
  const sampleFacets = require('../sampleData/Facets').default;

  // NOTE Add your own Mapbox key below
  
  <MapFacetContents
    buckets={sampleFacets.geoFacet.buckets}
    addFacetFilter={(bucket) => {
      alert(`Called to choose facet filter ${bucket.displayLabel()}`);
    }}
    size={{ width: 400, height: 250 }}
    mapboxKey=""
  />
```
