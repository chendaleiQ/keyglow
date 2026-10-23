import AppKit
import CoreGraphics

private func inputHeatTapCallback(
    proxy: CGEventTapProxy,
    type: CGEventType,
    event: CGEvent,
    refcon: UnsafeMutableRawPointer?
) -> Unmanaged<CGEvent>? {
    guard let refcon else { return Unmanaged.passUnretained(event) }
    let monitor = Unmanaged<EventMonitor>.fromOpaque(refcon).takeUnretainedValue()
    monitor.process(type: type, event: event)
    return Unmanaged.passUnretained(event)
}

final class EventMonitor {
    private(set) var isPaused = false
    private(set) var hasPermission = false
    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var previousFlags = CGEventFlags()
    private var lastMousePoint: CGPoint?
    private var lastMouseTimestamp: CGEventTimestamp = 0
    private let store: StatsStore

    init(store: StatsStore) {
        self.store = store
        hasPermission = CGPreflightListenEventAccess()
    }

    var isRunning: Bool { eventTap != nil }

    var status: String {
        if isPaused { return "paused" }
        if !hasPermission { return "noPermission" }
        if eventTap == nil { return "waiting" }
        return "monitoring"
    }

    func setPaused(_ paused: Bool) {
        isPaused = paused
    }

    @discardableResult
    func ensureRunning() -> Bool {
        hasPermission = CGPreflightListenEventAccess()
        guard hasPermission else { return false }
        if eventTap != nil { return true }
        return startTap()
    }

    @discardableResult
    func requestPermission() -> Bool {
        hasPermission = CGPreflightListenEventAccess()
        if !hasPermission {
            hasPermission = CGRequestListenEventAccess()
        }
        if hasPermission {
            _ = ensureRunning()
        }
        return hasPermission
    }

    func stop() {
        if let eventTap {
            CGEvent.tapEnable(tap: eventTap, enable: false)
        }
        if let runLoopSource {
            CFRunLoopRemoveSource(CFRunLoopGetMain(), runLoopSource, .commonModes)
        }
        runLoopSource = nil
        eventTap = nil
    }

    private func startTap() -> Bool {
        let eventTypes: [CGEventType] = [
            .keyDown,
            .flagsChanged,
            .leftMouseDown,
            .rightMouseDown,
            .otherMouseDown,
            .mouseMoved,
            .leftMouseDragged,
            .rightMouseDragged,
            .otherMouseDragged,
            .scrollWheel,
        ]
        var mask: CGEventMask = 0
        for type in eventTypes {
            mask |= CGEventMask(1) << CGEventMask(type.rawValue)
        }

        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .tailAppendEventTap,
            options: .listenOnly,
            eventsOfInterest: mask,
            callback: inputHeatTapCallback,
            userInfo: Unmanaged.passUnretained(self).toOpaque()
        ) else {
            NSLog("InputHeat: could not create event tap (permission pending?)")
            return false
        }

        guard let source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0) else {
            CFMachPortInvalidate(tap)
            return false
        }
        eventTap = tap
        runLoopSource = source
        CFRunLoopAddSource(CFRunLoopGetMain(), source, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
        previousFlags = CGEventSource.flagsState(.combinedSessionState)
        lastMousePoint = nil
        NSLog("InputHeat: event tap started")
        return true
    }

    fileprivate func process(type: CGEventType, event: CGEvent) {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let eventTap {
                CGEvent.tapEnable(tap: eventTap, enable: true)
            }
            return
        }
        guard !isPaused else { return }

        switch type {
        case .keyDown:
            if event.getIntegerValueField(.keyboardEventAutorepeat) != 0 { return }
            store.recordKey(Int(event.getIntegerValueField(.keyboardEventKeycode)))

        case .flagsChanged:
            let keyCode = Int(event.getIntegerValueField(.keyboardEventKeycode))
            let flags = event.flags
            if let mask = Self.modifierMask(for: keyCode) {
                let wasDown = previousFlags.contains(mask)
                if flags.contains(mask) && !wasDown {
                    store.recordKey(keyCode)
                }
            }
            previousFlags = flags

        case .leftMouseDown, .rightMouseDown, .otherMouseDown:
            let button = Int(event.getIntegerValueField(.mouseEventButtonNumber))
            store.recordClick(button: button, at: event.location)

        case .mouseMoved, .leftMouseDragged, .rightMouseDragged, .otherMouseDragged:
            let location = event.location
            var distance: Double = 0
            if let lastMousePoint, event.timestamp >= lastMouseTimestamp {
                let seconds = Double(event.timestamp - lastMouseTimestamp) / 1_000_000_000
                let delta = hypot(
                    Double(location.x - lastMousePoint.x),
                    Double(location.y - lastMousePoint.y)
                )
                if seconds < 2, delta < 5_000 {
                    distance = delta
                }
            }
            lastMousePoint = location
            lastMouseTimestamp = event.timestamp
            store.recordMouse(at: location, distance: distance)

        case .scrollWheel:
            let vertical = event.getDoubleValueField(.scrollWheelEventPointDeltaAxis1)
            let horizontal = event.getDoubleValueField(.scrollWheelEventPointDeltaAxis2)
            let lineVertical = event.getIntegerValueField(.scrollWheelEventDeltaAxis1)
            if vertical != 0 || horizontal != 0 || lineVertical != 0 {
                store.recordScroll()
            }

        default:
            break
        }
    }

    private static func modifierMask(for keyCode: Int) -> CGEventFlags? {
        switch keyCode {
        case 0x37, 0x36: return .maskCommand
        case 0x38, 0x3C: return .maskShift
        case 0x3A, 0x3D: return .maskAlternate
        case 0x3B, 0x3E: return .maskControl
        case 0x39: return .maskAlphaShift
        case 0x3F: return .maskSecondaryFn
        default: return nil
        }
    }
}
