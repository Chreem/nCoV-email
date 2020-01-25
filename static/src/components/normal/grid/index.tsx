import * as React from 'react'
import {Fragment, ReactElement, useEffect, useState} from "react";


interface GridPropsType<P = any> {
  data: P[][],
  renderData(d: P): ReactElement,
}


/**
 * 二维数组数据拍平为ReactElement
 */
export default ({data, renderData}: GridPropsType) => {
  if (!data) return null;
  const [view, setView] = useState(null);
  useEffect(() => {
    if (!data) return;
    const v = [];
    data.map(d => {
      if (!d) return null;
      return d.map(item => {
        v.push(renderData(item));
      });
    });
    setView(v);
  }, [data, renderData]);

  return <Fragment>{view}</Fragment>
};