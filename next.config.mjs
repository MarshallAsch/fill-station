/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: [
    'sequelize',
    'mariadb',
    'js-yaml',
    'nconf',
    'nconf-esm'
  ],
};

export default nextConfig;
