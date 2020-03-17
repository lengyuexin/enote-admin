import React, { memo } from 'react'
import './App.css'
import './index.css'
import { Switch, Route, withRouter } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import './assets/iconfont/iconfont.css'
import LoadableComponent from './utils/LoadableComponent'

//admin-index后台首页
const Index = LoadableComponent(import('./pages/Index'))
//admin-login后台登录页
const Login = LoadableComponent(import('./pages/Login'))

function App() {
  return (
    <Switch>
      <Route path='/login' component={Login} />
      <PrivateRoute path='/' component={Index} />
    </Switch>
  )
}

export default withRouter(memo(App))
