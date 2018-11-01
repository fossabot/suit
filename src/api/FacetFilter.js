// @flow

/**
 * A facet filter for a query
 */
export default class FacetFilter {
  constructor(facetName: string, bucketLabel: string, filter: string) {
    this.facetName = facetName;
    this.bucketLabel = bucketLabel;
    this.filter = filter;
  }

  /** The name of the facet */
  facetName: string;
  /** The human-readable label for this bucket */
  bucketLabel: string;
  /** The query string that will be used to filter the results for this facet/bucket */
  filter: string;
}
