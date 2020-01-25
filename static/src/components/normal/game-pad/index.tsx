import * as React from 'react'
import './style.less'
import {TouchEvent, useCallback, useEffect, useState} from "react";
import DirectControl from '~components/hoc/DirectControl'


interface GamepadPropsType {
  direct?: string,
  fire?: boolean,
  onDirectChange?(d: string): void;
  onConfirm?(c: boolean): void;
}


const Gamepad = ({direct, fire, onDirectChange, onConfirm, ...other}: GamepadPropsType) => {
  useEffect(() => onDirectChange && onDirectChange(direct), [direct]);
  useEffect(() => onConfirm && onConfirm(fire), [fire]);

  return <div className="game-pad">
    <div className="bottom"/>
    <div className="circle-out"/>
    <div className="circle-in"/>
    <div className="rocker-bottom"/>
    <div className={`rocker ${direct}`}>
      <div className="m"/>
      <div className="t" {...other}/>
    </div>
    <div className={`button${fire ? ' active' : ''}`}/>
  </div>
};

export default DirectControl<GamepadPropsType>(Gamepad);