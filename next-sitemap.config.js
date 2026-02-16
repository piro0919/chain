/** @type {import('next-sitemap').IConfig} */
module.exports = {
  generateIndexSitemap: false,
  generateRobotsTxt: true,
  siteUrl: process.env.SITE_URL || "https://chain.kkweb.io",
};
