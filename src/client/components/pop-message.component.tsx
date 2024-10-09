import type * as React from 'react';
import { message } from 'antd';
import { ColorFormat, CountdownCircleTimer } from 'react-countdown-circle-timer';
import colors from 'tailwindcss/colors';

export interface MessageProperty {
  content: React.ReactNode;
  duration?: number;
  onCountdownEnd?: () => void;
}

const defaultMessageDuration = 20;

const content = (msg: MessageProperty, iconClass: string, color: ColorFormat) => {
  return (
    <div className="flex items-center gap-2">
      <CountdownCircleTimer
        isPlaying
        duration={msg.duration ?? defaultMessageDuration}
        size={20}
        strokeWidth={2}
        colors={color}
        trailColor={'#ffffff'}
      >
        {() => <i className={`${iconClass} text-lg`} style={{ color }}></i>}
      </CountdownCircleTimer>
      <span>{msg.content}</span>
    </div>
  );
};

const regulateMessage = (msg: MessageProperty | string) => {
  if (typeof msg === 'string') {
    return {
      content: msg,
    } as MessageProperty;
  } else {
    return msg;
  }
};

const messageConfig = (msg: MessageProperty | string, iconClass: string, color: ColorFormat) => {
  const msgObj = regulateMessage(msg);
  const onClose = msgObj.onCountdownEnd ? msgObj.onCountdownEnd : undefined;

  return {
    content: content(msgObj, iconClass, color),
    duration: msgObj.duration ?? defaultMessageDuration,
    onClick: () => message.destroy(this),
    onClose,
  };
};

export const popMessage = {
  success: (msg: MessageProperty | string) =>
    message.open(messageConfig(regulateMessage(msg), 'ri-checkbox-circle-fill', colors.green['500'])),
  info: (msg: MessageProperty | string) =>
    message.open(messageConfig(regulateMessage(msg), 'ri-information-fill', colors.blue['500'])),
  warning: (msg: MessageProperty | string) =>
    message.open(messageConfig(regulateMessage(msg), 'ri-alarm-warning-fill', colors.orange['500'])),
  error: (msg: MessageProperty | string) =>
    message.open(messageConfig(regulateMessage(msg), 'ri-error-warning-fill', colors.red['500'])),
};