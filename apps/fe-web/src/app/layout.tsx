import "./globals.css";

import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";

const montserrat = Montserrat({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-primary-bold",
});
const poppins = Poppins({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-secondary-medium",
});

export const metadata: Metadata = {
  title: "MoviePals",
  description: "Swipe and find a movie to watch together",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={[
          montserrat.variable,
          poppins.variable,
          "bg-white dark:bg-neutral-1",
        ].join(" ")}
      >
        <div className="flex justify-center py-8">
          <Logo />
        </div>
        {children}
      </body>
    </html>
  );
}

function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className="stroke-neutral-1 dark:stroke-white"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.33317 18.6666C10.0404 18.6666 10.7187 18.3857 11.2188 17.8856C11.7189 17.3855 11.9998 16.7072 11.9998 16C11.9998 15.2927 11.7189 14.6144 11.2188 14.1143C10.7187 13.6142 10.0404 13.3333 9.33317 13.3333C8.62593 13.3333 7.94765 13.6142 7.44755 14.1143C6.94746 14.6144 6.6665 15.2927 6.6665 16C6.6665 16.7072 6.94746 17.3855 7.44755 17.8856C7.94765 18.3857 8.62593 18.6666 9.33317 18.6666ZM22.6665 18.6666C23.3737 18.6666 24.052 18.3857 24.5521 17.8856C25.0522 17.3855 25.3332 16.7072 25.3332 16C25.3332 15.2927 25.0522 14.6144 24.5521 14.1143C24.052 13.6142 23.3737 13.3333 22.6665 13.3333C21.9593 13.3333 21.281 13.6142 20.7809 14.1143C20.2808 14.6144 19.9998 15.2927 19.9998 16C19.9998 16.7072 20.2808 17.3855 20.7809 17.8856C21.281 18.3857 21.9593 18.6666 22.6665 18.6666ZM15.9998 12C16.7071 12 17.3854 11.719 17.8855 11.2189C18.3856 10.7188 18.6665 10.0405 18.6665 9.33329C18.6665 8.62605 18.3856 7.94777 17.8855 7.44767C17.3854 6.94758 16.7071 6.66663 15.9998 6.66663C15.2926 6.66663 14.6143 6.94758 14.1142 7.44767C13.6141 7.94777 13.3332 8.62605 13.3332 9.33329C13.3332 10.0405 13.6141 10.7188 14.1142 11.2189C14.6143 11.719 15.2926 12 15.9998 12ZM15.9998 25.3333C16.7071 25.3333 17.3854 25.0523 17.8855 24.5522C18.3856 24.0521 18.6665 23.3739 18.6665 22.6666C18.6665 21.9594 18.3856 21.2811 17.8855 20.781C17.3854 20.2809 16.7071 20 15.9998 20C15.2926 20 14.6143 20.2809 14.1142 20.781C13.6141 21.2811 13.3332 21.9594 13.3332 22.6666C13.3332 23.3739 13.6141 24.0521 14.1142 24.5522C14.6143 25.0523 15.2926 25.3333 15.9998 25.3333Z"
        //stroke="#0E0C10"
        stroke-width="2.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2.6665 16C2.6665 23.364 8.63584 29.3333 15.9998 29.3333C23.3638 29.3333 29.3332 23.364 29.3332 16C29.3332 8.63596 23.3638 2.66663 15.9998 2.66663C8.63584 2.66663 2.6665 8.63596 2.6665 16ZM2.6665 16V29.3333"
        //stroke="#0E0C10"
        stroke-width="2.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
