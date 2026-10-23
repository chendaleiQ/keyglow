import AppKit
import WebKit

private final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?

    init(target: WKScriptMessageHandler) {
        self.target = target
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}

/// A native strip above the web content that reliably moves the window when dragged.
private final class WindowDragBar: NSView {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool {
        true
    }

    override func mouseDown(with event: NSEvent) {
        guard let window else { return }
        if event.clickCount == 2 {
            window.performZoom(nil)
            return
        }
        NSCursor.closedHand.push()
        window.performDrag(with: event)
        NSCursor.pop()
    }

    override func resetCursorRects() {
        addCursorRect(bounds, cursor: .openHand)
    }
}

final class DashboardWindowController: NSWindowController, WKScriptMessageHandler, WKNavigationDelegate {
    var onReady: (() -> Void)?
    var onAction: ((String) -> Void)?

    private var webView: WKWebView!
    private var pageLoaded = false
    private var messageProxy: WeakScriptMessageHandler?

    init() {
        let configuration = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        configuration.userContentController = contentController
        configuration.suppressesIncrementalRendering = false

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.underPageBackgroundColor = NSColor(red: 0.043, green: 0.05, blue: 0.07, alpha: 1)

        let visible = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let initialWidth = min(1180, max(920, visible.width - 120))
        let initialHeight = min(980, max(680, visible.height - 80))
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: initialWidth, height: initialHeight),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.title = "KeyGlow"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.isMovableByWindowBackground = false
        window.isReleasedWhenClosed = false
        window.minSize = NSSize(width: 920, height: 680)
        window.backgroundColor = NSColor(red: 0.043, green: 0.05, blue: 0.07, alpha: 1)
        window.appearance = NSAppearance(named: .darkAqua)

        let container = NSView()
        container.addSubview(webView)

        let dragBar = WindowDragBar()
        dragBar.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(dragBar)

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            webView.topAnchor.constraint(equalTo: container.topAnchor),
            webView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            dragBar.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            dragBar.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            dragBar.topAnchor.constraint(equalTo: container.topAnchor),
            dragBar.heightAnchor.constraint(equalToConstant: 46),
        ])
        window.contentView = container

        super.init(window: window)
        self.webView = webView

        webView.navigationDelegate = self
        let proxy = WeakScriptMessageHandler(target: self)
        messageProxy = proxy
        contentController.add(proxy, name: "inputheat")

        if !window.setFrameUsingName("KeyGlowDashboardWindow") {
            window.center()
        }
        window.setFrameAutosaveName("KeyGlowDashboardWindow")

        guard let htmlURL = Bundle.main.url(forResource: "dashboard", withExtension: "html") else {
            NSLog("InputHeat: dashboard.html missing from bundle")
            return
        }
        webView.loadFileURL(htmlURL, allowingReadAccessTo: htmlURL.deletingLastPathComponent())
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    var isVisible: Bool {
        window?.isVisible ?? false
    }

    func present() {
        guard let window else { return }
        showWindow(nil)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func push(payload: [String: Any]) {
        guard pageLoaded else { return }
        webView.callAsyncJavaScript(
            "window.inputHeatRender && window.inputHeatRender(data)",
            arguments: ["data": payload],
            in: nil,
            in: .page
        ) { result in
            if case .failure(let error) = result {
                NSLog("InputHeat: dashboard update failed — %@", String(describing: error))
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard
            message.name == "inputheat",
            let body = message.body as? [String: Any],
            let action = body["action"] as? String
        else { return }
        if action == "ready" {
            onReady?()
        } else {
            onAction?(action)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        pageLoaded = true
        NSLog("InputHeat: dashboard loaded")
        onReady?()
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        if navigationAction.navigationType == .linkActivated, let url = navigationAction.request.url {
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }
}
