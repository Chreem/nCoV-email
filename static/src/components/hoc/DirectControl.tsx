import * as React from 'react'
import {ComponentType, useEffect, useRef, useState} from "react";
import {TouchEvent, MouseEvent, useCallback} from "react";


export interface DirectControlPropsType {
  directKey?: string[],
  fireKey?: string[],


  onClick?(e?: MouseEvent): void;
  onTouchStart?(e?: TouchEvent): void;
  onTouchMove?(e?: TouchEvent): void;
  onTouchEnd?(e?: TouchEvent): void;
}


const NORMAL = 'normal';
export default function <P = any>(Component: ComponentType<{ direct: string, fire: boolean }>) {
  let start = {x: 0, y: 0};
  return ({directKey, fireKey, ...props}: P & DirectControlPropsType) => {
    directKey = directKey || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    fireKey = fireKey || [' '];
    const [pad, setPadState] = useState(NORMAL);
    const [fire, setFireState] = useState(false);

    /**
     * 键盘按键
     */
    useEffect(() => {
      const keys = [];
      const move = (direction: string) => {
        setPadState(direction);
        if (keys.indexOf(direction) < 0) keys.push(direction);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (directKey.indexOf(e.key) >= 0) return move(e.key);
        if (fireKey.indexOf(e.key) >= 0) return setFireState(true);
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (directKey.indexOf(e.key) >= 0) {
          const i = keys.indexOf(e.key);
          if (i >= 0) keys.splice(i, 1);
          if (keys.length <= 0) setPadState(NORMAL);
          else setPadState(keys[keys.length - 1]);
          return;
        }
        if (fireKey.indexOf(e.key) >= 0) return setFireState(false);
      };


      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

    /**
     * 手势移动
     */
    const handleTouchStart = useCallback(({touches}: TouchEvent) => {
      const {clientX: x, clientY: y} = touches[0];
      start = {x, y};
    }, []);
    const handleTouchMove = useCallback(({touches}: TouchEvent) => {
      const {x, y} = start;
      const {clientX, clientY} = touches[0];
      const moveX = clientX - x;
      const moveY = clientY - y;
      if (Math.abs(moveX) <= 30 && Math.abs(moveY) <= 30) return setPadState('normal');
      if (Math.abs(moveX) > Math.abs(moveY)) setPadState(moveX > 0 ? 'ArrowRight' : 'ArrowLeft');
      else setPadState(moveY > 0 ? 'ArrowDown' : 'ArrowUp');
    }, []);
    const handleTouchEnd = useCallback(() => setPadState('normal'), []);

    /**
     * 手势开火
     */
    let clickFireTimer = useRef<number>(null);
    const handleClick = useCallback(() => {
      setFireState(true);
      clearTimeout(clickFireTimer.current);
      clickFireTimer.current = window.setTimeout(() => setFireState(false), 50);
    }, []);


    return <Component {...props}
                      direct={pad}
                      fire={fire}
                      onClick={handleClick}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}/>;
  }
};