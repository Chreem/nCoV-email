import '@babel/polyfill'
import * as React from 'react'
import {Fragment} from 'react'
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import guid from '~vendor/guid'
import routes from './pages/route'
import './style.less'


export default function Component() {
  const routesView = routes.map(route => <Route key={guid()} {...route}/>);

  return <Fragment>
    <Router>
      <Switch>{routesView}</Switch>
    </Router>
  </Fragment>
}