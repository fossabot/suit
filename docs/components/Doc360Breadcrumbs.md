#### Examples:


__1:__ Description.

```jsx
const { Link, MemoryRouter, Route, Switch } = require('react-router-dom');
const SearchDocument = require('../../src/api/SearchDocument').default;

const history = [
  new Doc360Breadcrumbs.HistoryEntry('A Way Back', { pathname: 'bar', search: '' }),
  new Doc360Breadcrumbs.HistoryEntry('Previous Page', { pathname: 'foo', search: '' }),
];
const fields = new Map();
fields.set('title', ['Previous Page']);
const doc = new SearchDocument(fields);

<MemoryRouter>
  <Switch>
    <Route exact path="/">
      <Doc360Breadcrumbs history={history} currentDoc={doc} />
    </Route>
  </Switch>
</MemoryRouter>

```
