import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated from 'react-native-reanimated';

export const NativeOnlyAnimatedView = React.forwardRef<
  React.ComponentRef<typeof Animated.View>,
  React.ComponentPropsWithoutRef<typeof Animated.View>
>((props, ref) => {
  if (Platform.OS === 'web') {
    const { entering, exiting, layout, ...rest } = props;
    return <View ref={ref as any} {...(rest as any)} />;
  }
  return <Animated.View ref={ref} {...props} />;
});

NativeOnlyAnimatedView.displayName = 'NativeOnlyAnimatedView';
