require('dotenv').config();
// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    PINATA_KEY: process.env.PINATA_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
  }
};
