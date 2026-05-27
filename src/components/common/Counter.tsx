"use client";

import React, {
  ElementType,
  HTMLAttributes,
  useRef,
  forwardRef,
  RefObject,
} from "react";
import useInViewCounter from "@/customHooks/useInViewCounter";

interface CounterProps extends HTMLAttributes<HTMLElement> {
  start: number;
  end: number;
  speed?: number;
  as?: ElementType; // any HTML tag, default 'span'
}

const Counter = forwardRef<HTMLElement, CounterProps>(
  ({ start, end, speed = 50, as: Tag = "span", ...rest }, ref) => {
    // Use the passed ref or internal ref
    const internalRef = useRef<HTMLElement | null>(null);
    const refToUse: RefObject<HTMLElement | null> = (ref as RefObject<HTMLElement>) || internalRef;

    const count = useInViewCounter(refToUse, start, end, speed);

    return (
      <Tag ref={refToUse} {...rest}>
        {count}
      </Tag>
    );
  }
);

Counter.displayName = "Counter";

export default Counter;
