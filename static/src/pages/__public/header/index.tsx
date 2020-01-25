import * as React from 'react'
import {ReactChild, useEffect, useState} from 'react'
import guid from '~vendor/guid'
import styled from '@emotion/styled'


interface HeaderStylePropsType {
  width?: number,
  height?: number,
  count?: [number, number]
}
const Header = styled.header<HeaderStylePropsType>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  > .row {
    display: flex;
    flex: 1;
    > .item {
      flex: 1;
    }
  }
`;


/**
 * 组件本体
 */
interface HeaderPropsType {
  images: string[],
  size?: [number, number],
  count?: [number, number],
  interval?: number,
  children?: ReactChild | ReactChild[]
}
export default ({images, interval, size, count, children, ...other}: HeaderPropsType) => {
  const [x, y] = size || [16, 10];
  const [countX, countY] = count || [10, 10];


  // 尺寸更新
  // 图片轮换
  interval = interval || 3000;
  let header: HTMLHeadElement = null;
  let changeBgiInterval = null;
  const len = images.length;
  const handleWindowResize = () => {
    const {clientWidth: cw} = header;
    header.style.height = (cw / x * y) + 'px';
  };
  useEffect(() => {
    handleWindowResize();
    let i = 0;
    header.style.backgroundImage = `url(${images[i]})`;
    changeBgiInterval = setInterval(() => {
      i = (i + 1) % len;
      header.style.backgroundImage = `url(${images[i]})`;
    }, interval);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      clearInterval(changeBgiInterval);
      window.removeEventListener('resize', handleWindowResize);
    }
  }, []);


  // 网格填充
  const items = [];
  for (let i = 1; i <= countY; i++) {
    const rowItems = [];
    for (let j = 1; j <= countX; j++) {
      rowItems.push(<div key={guid()} className="item"/>);
    }
    const gid = guid();
    items.push(<div key={gid} data-guid={gid} className="row">{rowItems}</div>);
  }


  return <Header ref={e => header = e}
                 {...other}>{items}{children}</Header>
}