import { DM_Sans, Manrope } from "next/font/google";

export const manrope = Manrope({
  weight: ["300","400", "500", "600", "700","800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const dmsans = DM_Sans({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dmsans",
});
