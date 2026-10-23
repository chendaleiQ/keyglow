#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

APP_NAME="KeyGlow"
BUNDLE_ID="com.chendaleiq.inputheat"
APP="dist/${APP_NAME}.app"
BIN_NAME="InputHeat"
BUILD_DIR=".build"

mkdir -p "$BUILD_DIR" "$APP/Contents/MacOS" "$APP/Contents/Resources"

echo "→ 编译 Swift…"
swiftc -O -swift-version 5 \
  Sources/AppDelegate.swift \
  Sources/DashboardWindow.swift \
  Sources/EventMonitor.swift \
  Sources/StatsStore.swift \
  Sources/main.swift \
  -o "$BUILD_DIR/$BIN_NAME" \
  -framework AppKit \
  -framework WebKit \
  -framework CoreGraphics \
  -framework ServiceManagement

cp Info.plist "$APP/Contents/Info.plist"
cp Resources/dashboard.html Resources/dashboard.css Resources/dashboard.js "$APP/Contents/Resources/"
cp "$BUILD_DIR/$BIN_NAME" "$APP/Contents/MacOS/$BIN_NAME"

if [[ -f Resources/AppIcon.icns ]]; then
  cp Resources/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
  /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string AppIcon" "$APP/Contents/Info.plist" >/dev/null 2>&1 || true
fi

plutil -lint "$APP/Contents/Info.plist" >/dev/null
xattr -cr "$APP" 2>/dev/null || true
codesign --force --deep --sign - --identifier "$BUNDLE_ID" "$APP" >/dev/null 2>&1

echo "✓ 构建完成：$APP"
echo "  启动：open \"$APP\""
