import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semiBold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
});

export const typography = {
  // Display
  displayLarge: { fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.3 },

  // Heading
  headingXL: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  headingLG: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  headingMD: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  headingSM: { fontSize: 16, fontWeight: '600', lineHeight: 24 },

  // Body
  bodyLG: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMD: { fontSize: 14, fontWeight: '400', lineHeight: 22 },
  bodySM: { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  bodyXS: { fontSize: 12, fontWeight: '400', lineHeight: 18 },

  // Label
  labelLG: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  labelMD: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  labelSM: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  labelXS: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
};

export { fontFamily };
