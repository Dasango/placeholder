import { cssInterop } from 'nativewind';
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import * as React from 'react';

type IconProps = LucideProps & {
  as: LucideIcon;
};

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

cssInterop(IconImpl, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      width: 'size',
      height: 'size',
      color: 'color',
    },
  },
});

export const Icon = IconImpl;
