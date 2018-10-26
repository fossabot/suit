// @flow
import React from 'react';

import Card from './Card';
import CollapsiblePanel from './CollapsiblePanel';

type FacetProps = {
  /**
   * The component to display as the facet's contents
   */
  contents: any;
  /**
   * The name to display for the facet.
   */
  name: string;
  /**
   * The name of the field or the field expression the facet is displaying.
   */
  field: string;
  /**
   * If set, then the facet will be displayed in a collapsible component. If
   * the facet is collapsible and has no buckets, it will be collapsed initially.
   */
  collapse: boolean;
  /**
   * If set, then the facet will be displayed in a card which has a border around it
   */
  bordered: boolean;
}

type FacetDefaultProps = {
  collapse: boolean;
  bordered: boolean;
};

/**
 * Display a single facet.
 */
export default class Facet extends React.Component<FacetDefaultProps, FacetProps, void> {
  static defaultProps = {
    collapse: false,
    bordered: false,
  };

  static displayName = 'Facet';

  render() {
    if (this.props.collapse) {
      return (
        <CollapsiblePanel title={this.props.name} id={`facet-${this.props.field}`}>
          {this.props.contents}
        </CollapsiblePanel>
      );
    }
    return (
      <Card title={this.props.name} borderless={!this.props.bordered} className="attivio-facet">
        {this.props.contents}
      </Card>
    );
  }
}
