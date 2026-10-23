#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

APP="dist/KeyGlow.app"
VERSION=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Contents/Info.plist")
DMG="dist/KeyGlow-${VERSION}-macos-universal.dmg"

# Package only a verified universal app; use the bundle's version as the source of truth.
codesign --verify --deep --strict "$APP"
lipo "$APP/Contents/MacOS/InputHeat" -verify_arch arm64
lipo "$APP/Contents/MacOS/InputHeat" -verify_arch x86_64

mkdir -p .build
STAGING=$(mktemp -d "$PWD/.build/dmg.XXXXXX")
trap 'rm -rf "$STAGING"' EXIT

ditto "$APP" "$STAGING/KeyGlow.app"
ln -s /Applications "$STAGING/Applications"
hdiutil create -volname "KeyGlow" -srcfolder "$STAGING" -fs HFS+ -format UDZO -ov "$DMG"
hdiutil verify "$DMG"
(cd dist && shasum -a 256 "$(basename "$DMG")" > "$(basename "$DMG").sha256")
echo "Packaged: $DMG"
