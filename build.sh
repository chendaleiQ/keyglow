#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

APP_NAME="KeyGlow"
BUNDLE_ID="com.chendaleiq.inputheat"
APP="dist/${APP_NAME}.app"
BIN_NAME="InputHeat"
BUILD_DIR=".build"
DEPLOYMENT_TARGET="13.0"

if [[ "${UNIVERSAL:-0}" == "1" ]]; then
  ARCHS=("arm64" "x86_64")
else
  ARCHS=("$(uname -m)")
fi

mkdir -p "$BUILD_DIR" "$APP/Contents/MacOS" "$APP/Contents/Resources"

BINARIES=()
for arch in "${ARCHS[@]}"; do
  echo "→ 编译 Swift ($arch)…"
  binary="$BUILD_DIR/$BIN_NAME-$arch"
  swiftc -O -swift-version 5 \
    -target "${arch}-apple-macos${DEPLOYMENT_TARGET}" \
    Sources/AppDelegate.swift \
    Sources/DashboardWindow.swift \
    Sources/EventMonitor.swift \
    Sources/StatsStore.swift \
    Sources/main.swift \
    -o "$binary" \
    -framework AppKit \
    -framework WebKit \
    -framework CoreGraphics \
    -framework ServiceManagement
  BINARIES+=("$binary")
done

cp Info.plist "$APP/Contents/Info.plist"
cp Resources/dashboard.html Resources/dashboard.css Resources/dashboard.js "$APP/Contents/Resources/"

if [[ ${#BINARIES[@]} -eq 1 ]]; then
  cp "${BINARIES[0]}" "$APP/Contents/MacOS/$BIN_NAME"
else
  lipo -create "${BINARIES[@]}" -output "$APP/Contents/MacOS/$BIN_NAME"
fi

if [[ -f Resources/AppIcon.icns ]]; then
  cp Resources/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
  /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string AppIcon" "$APP/Contents/Info.plist" >/dev/null 2>&1 || true
fi

plutil -lint "$APP/Contents/Info.plist" >/dev/null
xattr -cr "$APP" 2>/dev/null || true
codesign --force --deep --sign - --identifier "$BUNDLE_ID" "$APP" >/dev/null 2>&1

echo "✓ 构建完成：$APP"
echo "  架构：$(lipo -archs "$APP/Contents/MacOS/$BIN_NAME")"
echo "  启动：open \"$APP\""
