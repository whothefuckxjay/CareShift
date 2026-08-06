module.exports = function (api) {
  api.cache(true);
  return {
    // Reanimated v4 (SDK 54) — the worklets babel transform is applied
    // automatically by babel-preset-expo, no extra plugin needed here.
    presets: ["babel-preset-expo"],
  };
};
