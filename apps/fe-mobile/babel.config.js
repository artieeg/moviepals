module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    "module:react-native-dotenv",
    "nativewind/babel",
    ["module-resolver", {alias: {"~": "./src"}}],
    "react-native-reanimated/plugin",
  ],
};
