// @flow
import React from 'react';
import PropTypes from 'prop-types';

import Facet from './Facet';
import SearchFacet from '../api/SearchFacet';
import SearchFacetBucket from '../api/SearchFacetBucket';
import DateUtils from '../util/DateUtils';
import DateFormat from '../util/DateFormat';
import BarChartFacetContents from './BarChartFacetContents';
import PieChartFacetContents from './PieChartFacetContents';
import MoreListFacetContents from './MoreListFacetContents';
import ListWithBarsFacetContents from './ListWithBarsFacetContents';
import TagCloudFacetContents from './TagCloudFacetContents';
import TimeSeriesFacetContents from './TimeSeriesFacetContents';
import SentimentFacetContents from './SentimentFacetContents';
import MapFacetContents from './MapFacetContents';
import SentimentTagCloudFacetContents from './SentimentTagCloudFacetContents';
import FacetSearchBar from './FacetSearchBar';

export type FacetDisplayType = 'piechart' | 'barchart' | 'columnchart' | 'barlist' |
  'tagcloud' | 'timeseries' | 'sentiment' |'geomap' | 'list';

/**
 * This is the definition of a facet renderer. It is passed a facet from
 * the search results, the facet's position in the list, and the type, if any,
 * from the lists of facet types in the configuration.
 * It should return either a React component that will be rendered as the
 * facet's contents or null if the facet shouldn't be rendered by this function.
 * If no FacetContentsRenderer functions handle the rendering, then the facet
 * will be rendered by one of the default facet content types.
 */
export type FacetContentsRenderer = (facet: SearchFacet, position: number, type: FacetDisplayType) => any;

type FacetResultsProps = {
  /** The facet field names that should be displayed as pie charts */
  pieChartFacets: Array<string> | string | null;
  /** The facet field names that should be displayed as bar charts */
  barChartFacets: Array<string> | string | null;
  /** The facet field names that should be displayed as column charts */
  columnChartFacets: Array<string> | string | null;
  /** The facet field names that should be displayed as lists with bars */
  barListFacets: Array<string> | string | null;
  /** The facet field names that should be displayed as tag clouds */
  tagCloudFacets: Array<string> | string | null;
  /** The facet field names that should be displayed as time series */
  timeSeriesFacets: Array<string> | string | null;
  /** The facet field names that should be displayed with a sentiment bar */
  sentimentFacets: Array<string> | string | null;
  /** The facet field names that should be displayed with a geographic map */
  geoMapFacets: Array<string> | string | null;
  /**
   * The maximum number of items to show in a facet. If there
   * are more than this many buckets for the facet, only this many, with
   * the highest counts, will be shown. Defaults to 15.
   */
  maxFacetBuckets: number;
  /**
   * An optional list of facet field names which will be used to determine
   * the order in which the facets are shown. Any facets not named here will
   * appear after the called-out ones, in the order they are in in the
   * response.facets array of the parent Searcher component.
   */
  orderHint: Array<string>;
  /** Controls the colors used to show various entity types (the value can be any valid CSS color) */
  entityColors: Map<string, string>;
  /**
   * If set, then facets will appear in the results even if they contain no
   * buckets. By default, facets with no buckets will be hidden.
   */
  showEmptyFacets: boolean;
  /**
   * Any custom facet renderers you want to use. These will be callled, in order,
   * to render the contents of each facet. If a renderer renders the facet, the
   * subsequent ones won't be called. If no renderers are given, or if none
   * of the passed in renderers can or wants to render the facet, the default
   * behaviour will occur where the facet will be rendered based on the "type"
   * lists (pieChartFacets, barChartFacets, etc.), eventually defaulting to list
   * facets.
   */
  renderers: Array<FacetContentsRenderer>;
};

type FacetResultsDefaultProps = {
  pieChartFacets: Array<string> | string | null;
  barChartFacets: Array<string> | string | null;
  columnChartFacets: Array<string> | string | null;
  barListFacets: Array<string> | string | null;
  tagCloudFacets: Array<string> | string | null;
  timeSeriesFacets: Array<string> | string | null;
  sentimentFacets: Array<string> | string | null;
  geoMapFacets: Array<string> | string | null;
  maxFacetBuckets: number;
  orderHint: Array<string>;
  entityColors: Map<string, string>;
  showEmptyFacets: boolean;
  renderers: Array<FacetContentsRenderer>;
};

/**
 * A container for showing facet results from a search.
 * It must be contained within a Searcher component and
 * will obtain the list of facets from there. Via properties,
 * you can specify how to display specific facets. Any facet
 * not covered by one of these property's lists will be displayed
 * in a standard "More…" list.
 */
export default class FacetResults extends React.Component<FacetResultsDefaultProps, FacetResultsProps, void> {
  static defaultProps = {
    pieChartFacets: null,
    barChartFacets: null,
    columnChartFacets: null,
    barListFacets: null,
    tagCloudFacets: null,
    timeSeriesFacets: null,
    sentimentFacets: null,
    geoMapFacets: null,
    maxFacetBuckets: 15,
    orderHint: [],
    entityColors: new Map(),
    showEmptyFacets: false,
    renderers: [],
  };

  static contextTypes = {
    searcher: PropTypes.any,
  };

  static displayName = 'FacetResults';

  static matchesFacetList(field: string, facetList: Array<string> | string | null): boolean {
    if (facetList) {
      if (typeof facetList === 'string') {
        return (facetList: string) === field;
      }
      return (facetList: Array<string>).includes(field);
    }
    return false;
  }

  constructor(props: FacetResultsProps) {
    super(props);
    (this: any).addFacetFilter = this.addFacetFilter.bind(this);
    (this: any).addTimeSeriesFilter = this.addTimeSeriesFilter.bind(this);
  }

  addFacetFilter(bucket: SearchFacetBucket | any, customBucketLabel: ?string) {
    let bucketLabel;
    if (this.props.positiveKeyphrases || this.props.negativeKeyphrases) {
      bucketLabel = customBucketLabel || bucket.value.displayLabel();
      if (bucket.sentiment === 'positive' && this.props.positiveKeyphrases) {
        this.context.searcher.addFacetFilter(this.props.positiveKeyphrases.findLabel(), bucketLabel, bucket.value.filter);
      } else if (bucket.sentiment === 'negative' && this.props.negativeKeyphrases) {
        this.context.searcher.addFacetFilter(this.props.negativeKeyphrases.findLabel(), bucketLabel, bucket.value.filter);
      }
    } else if (this.props.facet) {
      bucketLabel = customBucketLabel || bucket.displayLabel();
      this.context.searcher.addFacetFilter(this.props.facet.findLabel(), bucketLabel, bucket.filter);
    }
  }

  /**
   * Create a facet filter for the starting and ending dates...
   * If start is set but end is not, filters on the specific time
   * set by start, otherwises filters on the range. (If start is not
   * set, this simply returns).
   */
  addTimeSeriesFilter(start: Date | null, end: Date | null) {
    if (start !== null) {
      let facetFilterString;
      let labelString;

      const startFacetFilterString = DateUtils.formatDate(start, DateFormat.ATTIVIO);
      const startLabelString = DateUtils.formatDate(start, DateFormat.MEDIUM);
      if (end !== null) {
        const endFacetFilterString = DateUtils.formatDate(end, DateFormat.ATTIVIO);
        const endLabelString = DateUtils.formatDate(end, DateFormat.MEDIUM);
        labelString = `${startLabelString} to ${endLabelString}`;

        facetFilterString = `${this.props.facet.name}:FACET(RANGE("${startFacetFilterString}", "${endFacetFilterString}", upper=inclusive))`; // eslint-disable-line max-len
      } else {
        labelString = startLabelString;
        facetFilterString = `${this.props.facet.name}:FACET(RANGE("${startFacetFilterString}", ${startFacetFilterString}, upper=inclusive))`; // eslint-disable-line max-len
      }
      this.context.searcher.addFacetFilter(this.props.facet.findLabel(), labelString, facetFilterString);
    }
  }

  renderBuiltInFacetType(facet: SearchFacet, type: FacetDisplayType): any {
    const facetColor = this.props.entityColors.has(facet.field) ? this.props.entityColors.get(facet.field) : null;
    let facetContents;

    switch (type) {
      case 'barchart':
        facetContents = facetColor ? (
          <BarChartFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
            color={facetColor}
          />
        ) : (
          <BarChartFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
          />
          );
        break;
      case 'columnchart':
        facetContents = facetColor ? (
          <BarChartFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
            columns
            color={facetColor}
          />
        ) : (
          <BarChartFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
            columns
          />
          );
        break;
      case 'piechart':
        facetContents = (
          <PieChartFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
            entityColors={this.props.entityColors}
          />
        );
        break;
      case 'barlist':
        facetContents = facetColor ? (
          <ListWithBarsFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
            color={facetColor}
          />
        ) : (
          <ListWithBarsFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
          />
          );
        break;
      case 'tagcloud':
        facetContents = (
          <TagCloudFacetContents
            buckets={facet.buckets}
            maxBuckets={this.props.maxFacetBuckets}
            addFacetFilter={this.addFacetFilter}
          />
        );
        break;
      case 'timeseries':
        facetContents = (
          <TimeSeriesFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addTimeSeriesFilter}
          />
        );
        break;
      case 'sentiment':
        facetContents = (
          <SentimentFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
          />
        );
        break;
      case 'geomap':
        facetContents = (
          <MapFacetContents
            buckets={facet.buckets}
            addFacetFilter={this.addFacetFilter}
          />
        );
        break;
      case 'list':
      default: {
        facetContents = (
          <FacetSearchBar
            name={facet.field}
            label={facet.label}
            addFacetFilter={this.addFacetFilter}
          >
            <MoreListFacetContents buckets={facet.buckets} addFacetFilter={this.addFacetFilter} />
          </FacetSearchBar>
        );
        break;
      }
    }
    return facetContents;
  }

  /**
   * Determine the type to use when displaying a facet based on the configuration's lists of
   * facet names for each type. Custom renderers are free to ignore the type when displaing
   * a facet that they know about...
   */
  getFacetDisplayType(field: string): FacetDisplayType {
    if (FacetResults.matchesFacetList(field, this.props.pieChartFacets)) {
      return 'piechart';
    }
    if (FacetResults.matchesFacetList(field, this.props.barChartFacets)) {
      return 'barchart';
    }
    if (FacetResults.matchesFacetList(field, this.props.columnChartFacets)) {
      return 'columnchart';
    }
    if (FacetResults.matchesFacetList(field, this.props.barListFacets)) {
      return 'barlist';
    }
    if (FacetResults.matchesFacetList(field, this.props.tagCloudFacets)) {
      return 'tagcloud';
    }
    if (FacetResults.matchesFacetList(field, this.props.timeSeriesFacets)) {
      return 'timeseries';
    }
    if (FacetResults.matchesFacetList(field, this.props.sentimentFacets)) {
      return 'sentiment';
    }
    if (FacetResults.matchesFacetList(field, this.props.geoMapFacets)) {
      return 'geomap';
    }

    return 'list';
  }

  shouldShow(facet: SearchFacet): boolean {
    if (this.props.showEmptyFacets || (facet && facet.buckets && facet.buckets.length > 0)) {
      return true;
    }
    return false;
  }

  findFacetContents(facet: SearchFacet, index: number): any {
    let result = null;
    if (this.shouldShow(facet)) {
      const type = this.getFacetDisplayType(facet.field);
      // Look through the registered rendering functions to find one who can render it
      for (let i = 0; i < this.props.renderers.length; i += 1) {
        const renderer = this.props.renderers[i];
        result = renderer(facet, index, type);
        if (result) {
          break;
        }
      }
      if (!result) {
        result = renderBuiltInFacetType(facet, type);
      }
    }
    return result;
  }

  pushFacetToResults(facets: Array<any>, facet: SearchFacet, contents: any) {
    // Prefer the display name but fall back to the name field
    const name = facet.findLabel();
    facets.push((
      <Facet
        name={name}
        field={facet.field}
        contents={facetContents}
        collapse
      />
    ));
  }

  renderFacets() {
    const searcher = this.context.searcher;
    const facets = searcher.state.response ? searcher.state.response.facets : null;
    if (facets && facets.length > 0) {
      const facetsMap: Map<string, SearchFacet> = new Map();
      facets.forEach((facet: SearchFacet) => {
        facetsMap.set(facet.name, facet);
      });
      const results = [];
      let i = 0;
      this.props.orderHint.forEach((facetName) => {
        const facet = facetsMap.get(facetName);
        if (facet) {
          i += 1;
          const facetContents = this.findFacetContents(facet, i);
          this.pushFacetToResults(results, facet, facetContents);
        }
      });
      facets.forEach((facet: SearchFacet) => {
        if (!this.props.orderHint.includes(facet.name)) {
          i += 1;
          const facetContents = this.findFacetContents(facet, i);
          this.pushFacetToResults(results, facet, facetContents);
        }
      });
      return results;
    }
    return null;
  }

  render() {
    const facets = this.renderFacets();
  
    return (
      <div className="facetResults">
        {facets}
      </div>
    );
  }
}

// if (this.props.type === 'sentimenttagcloud' && this.props.positiveKeyphrases && this.props.negativeKeyphrases) {
//   if (this.props.positiveKeyphrases.buckets && this.props.negativeKeyphrases.buckets) {
//     if (this.props.positiveKeyphrases.buckets.length > 0 || this.props.negativeKeyphrases.buckets.length > 0) {
//       facetContents = (
//         <SentimentTagCloudFacetContents
//           positiveBuckets={this.props.positiveKeyphrases.buckets}
//           negativeBuckets={this.props.negativeKeyphrases.buckets}
//           maxBuckets={this.props.maxBuckets}
//           addFacetFilter={this.addFacetFilter}
//         />
//       );
//     }
//   }
// }
