/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v2/users/:username",
        destination: "https://osu.ppy.sh/api/v2/users/:username",
      },
      {
        source: "/api/v2/users/:id/scores/best",
        destination: "https://osu.ppy.sh/api/v2/users/:id/scores/best",
      },
      {
        source: "/api/v2/users/:id/scores/recent",
        destination: "https://osu.ppy.sh/api/v2/users/:id/scores/recent",
      },
      {
        source: "/osu/:id",
        destination: "https://osu.ppy.sh/osu/:id",
      },
      {
        source: "/oauth/token",
        destination: "https://osu.ppy.sh/oauth/token",
      },
    ];
  },
};

module.exports = nextConfig;
