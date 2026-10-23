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
        webView.underPageBackgroundColor = .windowBackgroundColor

        let visible = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let initialWidth = min(1160, max(900, visible.width - 160))
        let initialHeight = min(900, max(660, visible.height - 120))
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: initialWidth, height: initialHeight),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "KeyGlow"
        window.isMovableByWindowBackground = false
        window.isReleasedWhenClosed = false
        window.minSize = NSSize(width: 920, height: 680)
        window.backgroundColor = .windowBackgroundColor

        let container = NSView()
        container.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            webView.topAnchor.constraint(equalTo: container.topAnchor),
            webView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
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
