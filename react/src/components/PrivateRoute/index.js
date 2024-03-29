import React from 'react'
import { Route, Redirect, } from 'react-router-dom'
import { isAuthenticated } from '../../utils/session'

const isAuth = !!isAuthenticated();

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    isAuth ? <Component {...props} /> : <Redirect to="/login" />
  )} />
)

export default PrivateRoute