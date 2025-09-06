// app/hooks/useTouchHandler.ts
import { useState, useCallback, useRef } from 'react';
import { Position, SwipeDirection } from '@/app/types/game';

interface TouchState {
  startPos: Position | null;
  startCoords: { x: number; y: number } | null;
  startTime: number;
  isDragging: boolean;
}

interface TouchHandlerProps {
  onSwipe: (from: Position, direction: SwipeDirection) => void;
  getPositionFromCoordinates: (x: number, y: number) => Position | null;
  minSwipeDistance: number;
  maxSwipeTime: number;
}

export const useTouchHandler = ({
  onSwipe,
  getPositionFromCoordinates,
  minSwipeDistance,
  maxSwipeTime
}: TouchHandlerProps) => {
  const [touchState, setTouchState] = useState<TouchState>({
    startPos: null,
    startCoords: null,
    startTime: 0,
    isDragging: false
  });

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const touchRef = useRef<TouchState>(touchState);

  // Keep ref in sync for event handlers
  touchRef.current = touchState;

  const resetTouch = useCallback(() => {
    setTouchState({
      startPos: null,
      startCoords: null,
      startTime: 0,
      isDragging: false
    });
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const getSwipeDirection = useCallback((
    startCoords: { x: number; y: number },
    endCoords: { x: number; y: number }
  ): SwipeDirection | null => {
    const deltaX = endCoords.x - startCoords.x;
    const deltaY = endCoords.y - startCoords.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check minimum distance
    if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
      return null;
    }

    // Determine dominant direction
    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, [minSwipeDistance]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const position = getPositionFromCoordinates(touch.clientX, touch.clientY);
    
    if (position) {
      setTouchState({
        startPos: position,
        startCoords: { x: touch.clientX, y: touch.clientY },
        startTime: Date.now(),
        isDragging: true
      });
      // Reset drag offset for immediate feedback
      setDragOffset({ x: 0, y: 0 });
    }
  }, [getPositionFromCoordinates]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchRef.current.isDragging || !touchRef.current.startCoords) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchRef.current.startCoords.x;
    const deltaY = touch.clientY - touchRef.current.startCoords.y;

    // Provide immediate visual feedback
    setDragOffset({
      x: Math.max(-40, Math.min(40, deltaX * 0.6)), // Less damped, more responsive
      y: Math.max(-40, Math.min(40, deltaY * 0.6))
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current.isDragging || !touchRef.current.startPos || !touchRef.current.startCoords) {
      resetTouch();
      return;
    }

    const touch = e.changedTouches[0];
    const endCoords = { x: touch.clientX, y: touch.clientY };
    const swipeTime = Date.now() - touchRef.current.startTime;

    // Check if swipe is within time limit
    if (swipeTime <= maxSwipeTime) {
      const direction = getSwipeDirection(touchRef.current.startCoords, endCoords);
      
      if (direction) {
        onSwipe(touchRef.current.startPos, direction);
      }
    }

    resetTouch();
  }, [getSwipeDirection, maxSwipeTime, onSwipe, resetTouch]);

  // Mouse handlers (for desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const position = getPositionFromCoordinates(e.clientX, e.clientY);
    
    if (position) {
      setTouchState({
        startPos: position,
        startCoords: { x: e.clientX, y: e.clientY },
        startTime: Date.now(),
        isDragging: true
      });
      // Reset drag offset for immediate feedback
      setDragOffset({ x: 0, y: 0 });
    }
  }, [getPositionFromCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchRef.current.isDragging || !touchRef.current.startCoords) return;

    const deltaX = e.clientX - touchRef.current.startCoords.x;
    const deltaY = e.clientY - touchRef.current.startCoords.y;

    // Provide immediate visual feedback
    setDragOffset({
      x: Math.max(-40, Math.min(40, deltaX * 0.6)),
      y: Math.max(-40, Math.min(40, deltaY * 0.6))
    });
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!touchRef.current.isDragging || !touchRef.current.startPos || !touchRef.current.startCoords) {
      resetTouch();
      return;
    }

    const endCoords = { x: e.clientX, y: e.clientY };
    const swipeTime = Date.now() - touchRef.current.startTime;

    if (swipeTime <= maxSwipeTime) {
      const direction = getSwipeDirection(touchRef.current.startCoords, endCoords);
      
      if (direction) {
        onSwipe(touchRef.current.startPos, direction);
      }
    }

    resetTouch();
  }, [getSwipeDirection, maxSwipeTime, onSwipe, resetTouch]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging: touchState.isDragging,
    dragOffset
  };
};