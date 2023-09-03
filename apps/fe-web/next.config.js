/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/testflight",
        destination: "https://testflight.apple.com/join/riAOMve5",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
