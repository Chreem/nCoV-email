import * as React from 'react'
import {createPortal} from 'react-dom'
import {ComponentType, useEffect, useState} from "react";
import createElement from '~vendor/create-element'


interface OptionsType {
  // id, className会优先class，以便创建多个portal
  id?: string,          // 传送节点的id，无默认值
  className?: string,   // 传送节点class，默认portal-hooks


  forceCreate?: boolean,// 无视传送节点是否存在，必定新建，默认true
  tagName?: string,     // 创建的标签，默认div
  destroy?: boolean,    // 生命周期结束时是否销毁传送节点，只能销毁该组件创建的节点，默认true
}


export default function <P = any>(Component: ComponentType<P>, options?: OptionsType) {
  const __defaultOptions: OptionsType = Object.assign<OptionsType, OptionsType>({
    forceCreate: true,
    className: (options.id && !options.className) ? '' : 'portal-hooks',
    tagName: 'div',
    destroy: true
  }, options);

  const {
    id: rootElementID,
    className: rootElementClass,
    forceCreate,
    tagName,
    destroy: destroyRootElement
  } = __defaultOptions;


  return ({...props}: P) => {
    const [node, setNode] = useState(null);
    useEffect(() => {
      let selector = rootElementID ? `#${rootElementID}` : '';
      if (rootElementClass) selector += `.${rootElementClass}`;
      let root = document.querySelector(selector);
      const isExistsRootElement = !!root;

      if (!forceCreate && isExistsRootElement) return setNode(root);

      // 强制创建参数生效 or 元素不存在
      if (isExistsRootElement && rootElementID) console.warn(`id为："${rootElementID}"，的元素已存在，但依然强制创建，可能导致选择器出错`);
      root = createElement(tagName, {
        id: rootElementID,
        className: rootElementClass
      });
      document.body.appendChild(root);
      setNode(root);

      // 销毁创建的节点
      if (destroyRootElement) return () => document.body.removeChild(root);
    }, []);

    if (!node) return null;
    return createPortal(<Component {...props}/>, node);
  }
}