import * as React from 'react'
import withPortal from '../portal-wrapper'
import './style.less'


const Dialog = ({text, ...other}) => {
  return <div className="dialog" {...other}>{text}</div>
};


export default withPortal(Dialog, {
  className: 'portal-hooks-dialog'
});