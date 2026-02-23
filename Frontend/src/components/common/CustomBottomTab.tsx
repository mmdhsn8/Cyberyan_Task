import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AppTabName } from '../../app/navigation/types';
import {
  BORDER_RADIUS,
  SPACE,
  TAB_ACTIVE_SELECTED_BG,
  TAB_ACTIVE_SELECTED_BORDER,
  vh,
} from '../../utils/constants';

interface CustomBottomTabProps {
  activeTab: AppTabName;
  onTabPress: (tab: AppTabName) => void;
}

const tabs: AppTabName[] = ['Wallet', 'Audit'];
const TAB_BACKGROUND_COLOR = 'rgba(255, 255, 255, 0.06)';
const TAB_BORDER_COLOR = 'rgba(255, 255, 255, 0.09)';
const TAB_TOP_BORDER_COLOR = 'rgba(255, 255, 255, 0.18)';
const LABEL_ANIMATION_DURATION = 760;
const INDICATOR_HORIZONTAL_INSET = 4;
const INDICATOR_VERTICAL_INSET = 4;

export const CustomBottomTab: React.FC<CustomBottomTabProps> = ({
  activeTab,
  onTabPress,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const animationTokenRef = useRef(0);
  const requestedTabRef = useRef<AppTabName | null>(null);
  const isAnimatingRef = useRef(false);
  
  const activeStates = useRef(
    tabs.map(() => new Animated.Value(0))
  ).current;

  const tabWidth = useMemo(() => {
    if (containerWidth <= 0) return 0;
    return containerWidth / tabs.length;
  }, [containerWidth]);

  const runTabAnimations = useCallback((targetIndex: number, onEnd?: () => void) => {
    // Stop previous animation with proper cleanup
    if (animationRef.current) {
      animationRef.current.stop();
      // Reset the indicator to current position to avoid jumps
      indicatorTranslateX.stopAnimation();
    }
    
    const animationToken = ++animationTokenRef.current;

    // Use spring for indicator with optimized parameters
    const indicatorAnimation = Animated.spring(indicatorTranslateX, {
      toValue: targetIndex * tabWidth,
      damping: 28, // Lower for more bounce
      stiffness: 60, // Lower for smoother motion
      mass: 1.2, // Slightly lower for faster response
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      useNativeDriver: true,
    });

    // Stagger the label animations slightly for more organic feel
    const labelAnimations = tabs.map((_, index) => {
      const delay = index === targetIndex ? 0 : 30; // Slight stagger for deactivating tabs
      return Animated.timing(activeStates[index], {
        toValue: index === targetIndex ? 1 : 0,
        duration: LABEL_ANIMATION_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Custom easing for smoother curve
        delay,
        useNativeDriver: false,
      });
    });

    // Use parallel for indicator and sequence for labels to avoid visual conflicts
    animationRef.current = Animated.parallel([
      indicatorAnimation,
      Animated.sequence(labelAnimations) // Sequence instead of parallel for smoother label transitions
    ], { stopTogether: false });

    animationRef.current.start(({ finished }) => {
      // Ignore completion callbacks from canceled/outdated animations.
      if (animationToken !== animationTokenRef.current || !finished) return;
      onEnd?.();
    });
  }, [indicatorTranslateX, tabWidth, activeStates]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab === activeTab);
    if (activeIndex === -1 || tabWidth <= 0) return;

    // Skip duplicate runs while a press-triggered animation for the same tab is still in flight.
    if (requestedTabRef.current === activeTab && isAnimatingRef.current) {
      return;
    }

    runTabAnimations(activeIndex, () => {
      requestedTabRef.current = null;
      isAnimatingRef.current = false;
    });
  }, [activeTab, tabWidth, runTabAnimations]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      animationTokenRef.current += 1;
      requestedTabRef.current = null;
      isAnimatingRef.current = false;
    };
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width !== containerWidth) {
      setContainerWidth(width);
      
      const activeIndex = tabs.findIndex(tab => tab === activeTab);
      if (activeIndex !== -1) {
        indicatorTranslateX.setValue(activeIndex * (width / tabs.length));
      }
      
      tabs.forEach((_, index) => {
        activeStates[index].setValue(index === activeIndex ? 1 : 0);
      });
    }
  }, [containerWidth, activeTab, indicatorTranslateX, activeStates]);

  const handleTabPress = useCallback((tab: AppTabName) => {
    if (tab === activeTab || isAnimatingRef.current) return;
    
    const nextIndex = tabs.findIndex(item => item === tab);
    if (nextIndex < 0) return;

    requestedTabRef.current = tab;
    isAnimatingRef.current = true;

    runTabAnimations(nextIndex, () => {
      requestedTabRef.current = null;
      isAnimatingRef.current = false;
    });
    
    onTabPress(tab);
  }, [activeTab, onTabPress, runTabAnimations]);

  const getTabColor = useCallback((index: number) => {
    return activeStates[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['#A7AFBD', '#FFFFFF'],
    });
  }, [activeStates]);

  return (
    <View style={[styles.wrapper, { paddingTop: SPACE.xs }]}>
      <View onLayout={handleLayout} style={styles.container}>
        <View pointerEvents="none" style={styles.topGloss} />
        {tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicator,
              {
                width: Math.max(tabWidth - INDICATOR_HORIZONTAL_INSET * 2, 0),
                transform: [{ translateX: indicatorTranslateX }],
                left: INDICATOR_HORIZONTAL_INSET,
              },
            ]}
          />
        ) : null}

        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={({ pressed }) => [
              styles.tabButton,
              pressed && styles.tabPressed,
            ]}
          >
            <Animated.Text
              style={[
                styles.tabLabel,
                { color: getTabColor(index) },
              ]}
            >
              {tab}
            </Animated.Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  //  elevation: 8,
  },
  container: {
    minHeight: vh(0.05),
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: TAB_BACKGROUND_COLOR,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderTopWidth: 0.4,
    borderColor: TAB_BORDER_COLOR,
    borderTopColor: TAB_TOP_BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    overflow: 'hidden',
    marginBottom: SPACE.md,
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  activeIndicator: {
    position: 'absolute',
    top: INDICATOR_VERTICAL_INSET,
    bottom: INDICATOR_VERTICAL_INSET,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: TAB_ACTIVE_SELECTED_BG,
    borderWidth: 1,
    borderColor: TAB_ACTIVE_SELECTED_BORDER,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingVertical: SPACE.sm,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
    fontWeight: '500',
  },
});
