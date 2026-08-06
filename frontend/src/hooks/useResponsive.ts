import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;
  const isDesktop = width >= 1024;
  const contentMaxWidth = isDesktop ? 900 : isTablet ? 680 : undefined;
  const columns = isDesktop ? 4 : isTablet ? 3 : 2;
  return { width, isTablet, isDesktop, contentMaxWidth, columns };
}
