// @flow

import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Modal from 'react-bootstrap/lib/Modal';

import Scrollable from './Scrollable';
import WizardSteps, { WizardStep } from './WizardSteps';

export class WizardPageDefinition {
  /**
   * This is an identifier for this wizard page. It must be
   * unique among the pages in a given wizard.
   */
  key: string;
  /**
   * The title for this page in the wizard. Will be displayed in
   * the list of pages that lets the user know where they are
   * in the process of completing the forms.
   */
  title: string;
  /**
   * This callback is used to get the object representing the current
   * value for this page. This value is included in the map of all
   * values sent to the finish method for the wizard. Ideally, your
   * page will cache this as the user edits the values in the page's
   * controls so returning the value is fast.
   *
   * If your page updates the value object in the state when it changes,
   * you don't need to implement this method. In addition, if your
   * page is purely informational, you can omit this method.
   */
  getValue: null | () => any;
  /**
   * ????
   */
  pageTitle: string | React$Element<*> | null;
  /**
   * Callback used to validate the current state of the page. Returns a
   * promise so that you may make asynchronous calls to the server
   * if necessary to validate your fields. This Promise should resolve
   * to void in the case of the page being valid or to a string
   * describing the validation error in case it doesn't pass muster,
   * in which case the method should also deal with any updates to the
   * page's contents to show the error state to the user. The parameter
   * to this method is a map containing the values of all of the pages
   * in the wizard that are visible, in case the page's validation
   * depends on another page's state.
   *
   * If your page is always valid, you can omit this method.
   */
  validate: null | (values: Map<string, any>) => Promise<void>;
  /**
   * Callback used to allow the page to update itself based on
   * the state of the other pages in the wizard. Called right
   * before the wizard switches to show the page.
   *
   * If your page doesn't care, you can omit this method.
   */
  aboutToShow: null | (values: Map<string, any>) => void;
  /**
   * Set to true if this page is not required to be complete for the user to finish
   * the wizard. Defaults to false.
   */
  optional: boolean;
  /**
   * The component to display for the wizard page.
   */
  page: React$Element<*>;

  constructor(
    key: string,
    title: string,
    pageTitle: string | React$Element<*> | null,
    page: React$Element <*>,
    getValue: null | () => any = null,
    validate: null | (values: Map<string, any>) => Promise < void> = null,
    aboutToShow: null | (values: Map<string, any>) => void = null,
    optional: boolean = false,
  ) {
    this.key = key;
    this.title = title;
    this.getValue = getValue;
    this.pageTitle = pageTitle;
    this.page = page;
    this.optional = optional;
    this.validate = validate;
    this.aboutToShow = aboutToShow;
  }
}

export class WizardPageState {
  key: string;
  value: any;
  enabled: boolean;
  valid: boolean;

  constructor(key: string, value: any = {}, enabled: boolean = true, valid: boolean = false) {
    this.key = key;
    this.value = value;
    this.enabled = enabled;
    this.valid = valid;
  }
}


type WizardProps = {
  /**
   * The title to show at the top of the wizard's dialog box.
   */
  title: string;
  /**
   * An array of WizardPageDefinitions defining the pages to show.
   */
  pages: Array<WizardPageDefinition>;
  /**
   * A callback used when the wizard is finished. If the value
   * parameter is not set, then the wizard is being cancelled.
   * Otherwise, the value parameter contains a map of each page's
   * pageKey to its current value.
   */
  onFinish: (Map<string, any> | null) => void;
  /**
   * If set, then the wizard will be shown.
   */
  show: boolean;
  /**
   * The size of the wizard, if you want it larger or smaller
   * than the default. Set to 'small' or 'large' or leave unset
   * for the medium size.
   */
  size: 'small' | 'large' | null;
  /**
   * This is a map showing which pages consider themselves valid.
   */
  validity: Map<string, boolean>;
};

type WizardDefaultProps = {
  size: 'small' | 'large' | null;
};

type WizardState = {
  visiblePages: Array<string>;
  currentKey: string;
  currentPage: WizardPageDefinition;
};

/**
 * This component presents a series of pages which are used by the user, in sequence,
 * to enter data. The pages in the list can be enabled or disabled at any time.
 */
export default class Wizard extends React.Component<WizardDefaultProps, WizardProps, WizardState> {
  static defaultProps = {
    size: null,
  };

  static WizardPageDefinition;

  constructor(props: WizardProps) {
    super(props);
    // Set the initial state
    const visiblePages = [];
    this.props.pages.forEach((page) => {
      visiblePages.push(page.key);
    });
    this.state = {
      visiblePages,
      currentKey: this.props.pages[0].key,
      currentPage: this.props.pages[0],
    };
    (this: any).cancel = this.cancel.bind(this);
    (this: any).finish = this.finish.bind(this);
    (this: any).nextPage = this.nextPage.bind(this);
    (this: any).previousPage = this.previousPage.bind(this);
  }

  state: WizardState;

  componentWillReceiveProps(newProps: WizardProps) {
    if (newProps.pages !== this.props.pages) {
      const visiblePages = [];
      let currentPage: WizardPageDefinition = this.state.currentPage;
      newProps.pages.forEach((page: WizardPageDefinition) => {
        visiblePages.push(page.key);
        if (page.key === this.state.currentKey) {
          currentPage = page;
        }
      });
      this.setState({
        visiblePages,
        currentPage,
      });
    }
  }

  getPage(pageKey: string): WizardPageDefinition {
    const index = this.props.pages.findIndex((page: WizardPageDefinition) => {
      return page.key === pageKey;
    });
    return this.props.pages[index];
  }

  getNextPageKey(): string | null {
    const currentPageIndex = this.state.visiblePages.findIndex((pageKey) => {
      return pageKey === this.state.currentKey;
    });
    if (currentPageIndex >= 0) {
      const nextPageIndex = currentPageIndex + 1;
      if (nextPageIndex < this.state.visiblePages.length) {
        return this.state.visiblePages[nextPageIndex];
      }
    }
    return null;
  }

  getPreviousPageKey(): string | null {
    const currentPageIndex = this.state.visiblePages.findIndex((pageKey) => {
      return pageKey === this.state.currentKey;
    });
    if (currentPageIndex >= 1) {
      const previousPageIndex = currentPageIndex - 1;
      return this.state.visiblePages[previousPageIndex];
    }
    return null;
  }

  currentPageValid(): boolean {
    const key = this.state.currentPage.key;
    return this.props.validity.get(key) === true;
  }

  cancel() {
    this.props.onFinish(null);
  }

  finish() {
    this.props.onFinish(true);
  }

  changePage(newPageKey: string | null) {
    if (newPageKey) {
      const newPage = this.getPage(newPageKey);
      this.setState({
        currentKey: newPageKey,
        currentPage: newPage,
      });
    }
  }

  nextPage() {
    this.changePage(this.getNextPageKey());
  }

  previousPage() {
    this.changePage(this.getPreviousPageKey());
  }

  doneWithRequired(): boolean {
    const currentPageIndex = this.state.visiblePages.indexOf(this.state.currentKey);
    const remainingPages = this.state.visiblePages.slice(currentPageIndex + 1);
    if (remainingPages && remainingPages.length) {
      // There are remaining visible pages... check if any is required.
      return !remainingPages.some((remainingPageKey) => {
        return !this.getPage(remainingPageKey).optional;
      });
    }
    // We're on the last visible page, so we're done!
    return true;
  }

  render() {
    if (this.props.show) {
      const steps = [];
      this.state.visiblePages.forEach((visiblePageKey) => {
        const visiblePage = this.getPage(visiblePageKey);
        steps.push(new WizardStep(visiblePageKey, visiblePage.title));
      });

      const previousKey = this.getPreviousPageKey();
      const nextKey = this.getNextPageKey();

      // We can always go back if there's a previous page
      const canPrevious = !!previousKey;
      // We can go forward if there's a next page AND the current one is valid
      const canNext = !!nextKey && this.currentPageValid();
      // We can finish if there is no next page or the remaining pages are not required
      // AND the current(last) one is valid
      const canFinish = !nextKey || this.doneWithRequired();
      const finishStyle = canFinish ? 'primary' : 'default';
      const nextStyle = canNext && !canFinish ? 'primary' : 'default';

      return (
        <Modal
          show={this.props.show}
          bsSize={this.props.size}
          backdrop="static"
          keyboard
        >
          <Modal.Header>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ paddingLeft: 0 }}>
            <div style={{ height: '100%' }}>
              <WizardSteps
                steps={steps}
                currentStep={this.state.currentKey}
                goToPage={() => { }}
              />
              <Scrollable>
                <h3>{this.state.currentPage.pageTitle}</h3>
                {this.state.currentPage.page}
              </Scrollable>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar style={{ float: 'right' }}>
              <Button
                onClick={this.cancel}
              >
                Cancel
              </Button>
              <Button
                disabled={!canPrevious}
                onClick={this.previousPage}
              >
                Previous
              </Button>
              <Button
                disabled={!canNext}
                bsStyle={nextStyle}
                onClick={this.nextPage}
              >
                Next
              </Button>
              <Button
                disabled={!canFinish}
                bsStyle={finishStyle}
                onClick={this.finish}
              >
                Finish
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      );
    }
    // Not shown...
    return null;
  }
}

Wizard.WizardPageDefinition = WizardPageDefinition;
