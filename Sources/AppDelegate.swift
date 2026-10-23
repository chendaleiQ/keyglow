import AppKit
import CoreGraphics
import ServiceManagement

final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private let store = StatsStore()
    private lazy var monitor = EventMonitor(store: store)
    private var statusItem: NSStatusItem?
    private var menu: NSMenu?
    private var dashboard: DashboardWindowController?
    private var tickTimer: Timer?
    private var saveTimer: Timer?
    private var observers: [NSObjectProtocol] = []
    private var todayItem: NSMenuItem?
    private var pauseItem: NSMenuItem?
    private var loginItem: NSMenuItem?
    private var permissionItem: NSMenuItem?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        setupStatusItem()
        monitor.ensureRunning()
        installObservers()
        installTimers()

        if !UserDefaults.standard.bool(forKey: "InputHeatHasLaunched") {
            UserDefaults.standard.set(true, forKey: "InputHeatHasLaunched")
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.openDashboard()
            }
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        store.saveIfNeeded(force: true)
        monitor.stop()
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        openDashboard()
        return true
    }

    func menuWillOpen(_ menu: NSMenu) {
        refreshMenuState()
    }

    private func setupStatusItem() {
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = item.button {
            let image = NSImage(systemSymbolName: "keyboard", accessibilityDescription: "KeyGlow")
            image?.isTemplate = true
            button.image = image
            button.target = self
            button.action = #selector(statusButtonClicked(_:))
            button.sendAction(on: [.leftMouseUp, .rightMouseUp])
            button.toolTip = "KeyGlow"
        }

        statusItem = item
        rebuildMenu()
    }

    private func rebuildMenu() {
        let loc = Localization.shared
        let menu = NSMenu()
        menu.delegate = self

        let open = NSMenuItem(title: loc.text("menu.open"), action: #selector(openDashboard), keyEquivalent: "o")
        open.target = self
        menu.addItem(open)
        menu.addItem(.separator())

        let today = NSMenuItem(title: "", action: nil, keyEquivalent: "")
        today.isEnabled = false
        menu.addItem(today)
        todayItem = today

        let pause = NSMenuItem(
            title: loc.text("menu.pause"),
            action: #selector(togglePause),
            keyEquivalent: "p"
        )
        pause.target = self
        menu.addItem(pause)
        pauseItem = pause

        menu.addItem(.separator())

        let permission = NSMenuItem(
            title: loc.text("menu.permission.off"),
            action: #selector(openPermissionSettings),
            keyEquivalent: ""
        )
        permission.target = self
        menu.addItem(permission)
        permissionItem = permission

        let login = NSMenuItem(title: loc.text("menu.login"), action: #selector(toggleLoginItem), keyEquivalent: "")
        login.target = self
        menu.addItem(login)
        loginItem = login

        let folder = NSMenuItem(title: loc.text("menu.dataFolder"), action: #selector(openDataFolder), keyEquivalent: "")
        folder.target = self
        menu.addItem(folder)

        menu.addItem(.separator())

        let language = NSMenuItem(title: loc.text("menu.language"), action: nil, keyEquivalent: "")
        let languageMenu = NSMenu()
        for choice in AppLanguage.allCases {
            let item = NSMenuItem(
                title: loc.text("language.\(choice.rawValue)"),
                action: #selector(selectLanguage(_:)),
                keyEquivalent: ""
            )
            item.target = self
            item.representedObject = choice.rawValue
            item.state = loc.preference == choice ? .on : .off
            languageMenu.addItem(item)
        }
        language.submenu = languageMenu
        menu.addItem(language)

        menu.addItem(.separator())

        let quit = NSMenuItem(title: loc.text("menu.quit"), action: #selector(quitApp), keyEquivalent: "q")
        quit.target = self
        menu.addItem(quit)

        self.menu = menu
        refreshMenuState()
    }

    @objc private func statusButtonClicked(_ sender: Any?) {
        let event = NSApp.currentEvent
        let wantsMenu = event?.type == .rightMouseUp || event?.modifierFlags.contains(.control) == true
        if wantsMenu, let menu, let statusItem {
            statusItem.menu = menu
            statusItem.button?.performClick(nil)
            statusItem.menu = nil
        } else {
            openDashboard()
        }
    }

    @objc private func openDashboard() {
        let controller = dashboardController()
        controller.present()
        pushDashboard(full: true)
    }

    @objc private func togglePause() {
        monitor.setPaused(!monitor.isPaused)
        refreshMenuState()
        updateStatusItemTooltip()
        pushDashboard(full: false)
    }

    @objc private func selectLanguage(_ sender: NSMenuItem) {
        guard
            let raw = sender.representedObject as? String,
            let language = AppLanguage(rawValue: raw)
        else { return }

        changeLanguage(language)
    }

    private func changeLanguage(_ language: AppLanguage) {
        let loc = Localization.shared
        guard loc.preference != language else { return }

        loc.setPreference(language)
        rebuildMenu()
        updateStatusItemTooltip()
        pushDashboard(full: true)
    }

    @objc private func openPermissionSettings() {
        guard let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent") else {
            return
        }
        NSWorkspace.shared.open(url)
    }

    @objc private func openDataFolder() {
        NSWorkspace.shared.open(StatsStore.dataDirectory)
    }

    @objc private func toggleLoginItem() {
        let service = SMAppService.mainApp
        do {
            if service.status == .enabled {
                try service.unregister()
            } else {
                try service.register()
            }
        } catch {
            NSApp.activate(ignoringOtherApps: true)
            let loc = Localization.shared
            let alert = NSAlert()
            alert.messageText = loc.text("alert.login.title")
            alert.informativeText = loc.text("alert.login.body", error.localizedDescription)
            alert.alertStyle = .warning
            alert.addButton(withTitle: loc.text("alert.ok"))
            alert.runModal()
        }
        refreshMenuState()
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }

    private func dashboardController() -> DashboardWindowController {
        if let dashboard { return dashboard }
        let controller = DashboardWindowController()
        controller.onReady = { [weak self] in
            self?.pushDashboard(full: true)
        }
        controller.onAction = { [weak self] action in
            self?.handleDashboardAction(action)
        }
        dashboard = controller
        return controller
    }

    private func handleDashboardAction(_ action: String) {
        switch action {
        case "requestPermission":
            _ = monitor.requestPermission()
            refreshMenuState()
            updateStatusItemTooltip()
            pushDashboard(full: false)
        case "openPermissionSettings":
            openPermissionSettings()
        case "togglePause":
            togglePause()
        case "openDataFolder":
            openDataFolder()
        case "language:system":
            changeLanguage(.system)
        case "language:en":
            changeLanguage(.en)
        case "language:zh":
            changeLanguage(.zh)
        case "restartApp":
            relaunch()
        default:
            break
        }
    }

    private func makePayload(full: Bool) -> [String: Any] {
        var payload = store.payload(full: full)
        payload["status"] = monitor.status
        payload["paused"] = monitor.isPaused
        payload["language"] = Localization.shared.languageCode
        payload["languagePreference"] = Localization.shared.preference.rawValue
        return payload
    }

    private func pushDashboard(full: Bool) {
        guard let dashboard, dashboard.isVisible else { return }
        dashboard.push(payload: makePayload(full: full))
    }

    private func installObservers() {
        observers.append(NotificationCenter.default.addObserver(
            forName: NSApplication.didChangeScreenParametersNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.store.refreshDisplays()
            self?.pushDashboard(full: true)
        })

        observers.append(NSWorkspace.shared.notificationCenter.addObserver(
            forName: NSWorkspace.didWakeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.monitor.ensureRunning()
            self?.pushDashboard(full: false)
        })
    }

    private func installTimers() {
        let tick = Timer(timeInterval: 1.5, repeats: true) { [weak self] _ in
            self?.tick()
        }
        RunLoop.main.add(tick, forMode: .common)
        tickTimer = tick

        let save = Timer(timeInterval: 15, repeats: true) { [weak self] _ in
            self?.store.saveIfNeeded()
        }
        RunLoop.main.add(save, forMode: .common)
        saveTimer = save
    }

    private func tick() {
        store.refreshDayIfNeeded()
        monitor.ensureRunning()
        updateStatusItemTooltip()
        refreshTodayItem()
        pushDashboard(full: false)
    }

    private func refreshMenuState() {
        let loc = Localization.shared
        refreshTodayItem()
        pauseItem?.title = loc.text(monitor.isPaused ? "menu.resume" : "menu.pause")
        if #available(macOS 13.0, *) {
            loginItem?.state = SMAppService.mainApp.status == .enabled ? .on : .off
        }
        switch monitor.status {
        case "monitoring": permissionItem?.title = loc.text("menu.permission.on")
        case "paused": permissionItem?.title = loc.text("menu.permission.on")
        case "waiting": permissionItem?.title = loc.text("menu.permission.waiting")
        default: permissionItem?.title = loc.text("menu.permission.off")
        }
    }

    private func refreshTodayItem() {
        let summary = store.todaySummary
        let loc = Localization.shared
        todayItem?.title = loc.text(
            "menu.today",
            formatted(summary.keys),
            formatted(summary.clicks)
        )
    }

    private func updateStatusItemTooltip() {
        let summary = store.todaySummary
        let loc = Localization.shared
        let stateKey: String
        switch monitor.status {
        case "monitoring": stateKey = "state.recording"
        case "paused": stateKey = "state.paused"
        case "waiting": stateKey = "state.waiting"
        default: stateKey = "state.noPermission"
        }
        statusItem?.button?.toolTip = loc.text(
            "tooltip.format",
            loc.text(stateKey),
            formatted(summary.keys)
        )
    }

    private func formatted(_ value: Int) -> String {
        NumberFormatter.localizedString(from: NSNumber(value: value), number: .decimal)
    }

    private func relaunch() {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/open")
        process.arguments = ["-n", Bundle.main.bundlePath]
        do {
            try process.run()
            NSApp.terminate(nil)
        } catch {
            NSLog("InputHeat: relaunch failed — %@", String(describing: error))
        }
    }
}
