import * as React from 'react'
import {HTMLProps, ReactElement, useEffect, useState} from "react";
import './style.less'


interface OverlayPropsType extends HTMLProps<HTMLDivElement> {
  active?: boolean;
  defaultActive?: boolean;
  children?: string | ReactElement | ReactElement[],
}


export default ({className, active, defaultActive, children, ...other}: OverlayPropsType) => {
  const [__active, setActive] = useState(defaultActive);
  useEffect(() => {
    if (typeof active === 'undefined') return;
    setActive(active);
  }, [active]);


  return <div className={`overlay ${__active ? 'active' : ''} ${className || ''}`}
              {...other}>
    {children}
  </div>
}