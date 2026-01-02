import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Mobilis",
  version: packageJson.version,
  copyright: `© ${currentYear}, Mobilis.`,
  meta: {
    title: "Мобилис",
  },
};
