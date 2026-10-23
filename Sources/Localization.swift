import Foundation

enum AppLanguage: String, CaseIterable {
    case system
    case en
    case zh
}

final class Localization {
    static let shared = Localization()

    private let preferenceKey = "KeyGlowLanguage"
    private(set) var preference: AppLanguage

    private init() {
        let saved = UserDefaults.standard.string(forKey: preferenceKey) ?? AppLanguage.system.rawValue
        preference = AppLanguage(rawValue: saved) ?? .system
    }

    var resolved: AppLanguage {
        preference == .system ? Self.detectSystemLanguage() : preference
    }

    var languageCode: String {
        resolved == .zh ? "zh" : "en"
    }

    var isChinese: Bool {
        resolved == .zh
    }

    func setPreference(_ language: AppLanguage) {
        preference = language
        UserDefaults.standard.set(language.rawValue, forKey: preferenceKey)
    }

    func text(_ key: String, _ arguments: CVarArg...) -> String {
        let table = isChinese ? Self.zh : Self.en
        let format = table[key] ?? Self.en[key] ?? key
        guard !arguments.isEmpty else { return format }
        return String(
            format: format,
            locale: Locale(identifier: isChinese ? "zh_CN" : "en_US"),
            arguments: arguments
        )
    }

    private static func detectSystemLanguage() -> AppLanguage {
        let preferred = Locale.preferredLanguages.first?.lowercased() ?? "en"
        return preferred.hasPrefix("zh") ? .zh : .en
    }

    private static let en: [String: String] = [
        "menu.open": "Open KeyGlow",
        "menu.today": "Today: %@ presses · %@ clicks",
        "menu.pause": "Pause Recording",
        "menu.resume": "Resume Recording",
        "menu.permission.on": "Input Monitoring: On",
        "menu.permission.waiting": "Input Monitoring: Waiting",
        "menu.permission.off": "Input Monitoring: Off…",
        "menu.login": "Launch at Login",
        "menu.dataFolder": "Open Data Folder",
        "menu.language": "Language",
        "menu.quit": "Quit KeyGlow",
        "language.system": "Follow System",
        "language.en": "English",
        "language.zh": "简体中文",
        "state.recording": "Recording",
        "state.paused": "Paused",
        "state.waiting": "Waiting for permission",
        "state.noPermission": "Not authorized",
        "tooltip.format": "KeyGlow · %@ · %@ presses today",
        "alert.login.title": "Could Not Enable Launch at Login",
        "alert.login.body": "Move KeyGlow to the Applications folder, then enable it under System Settings › General › Login Items.\n\n%@",
        "alert.ok": "OK",
    ]

    private static let zh: [String: String] = [
        "menu.open": "打开 KeyGlow",
        "menu.today": "今日：%@ 次按键 · %@ 次点击",
        "menu.pause": "暂停记录",
        "menu.resume": "继续记录",
        "menu.permission.on": "输入监控权限：已开启",
        "menu.permission.waiting": "输入监控权限：等待生效",
        "menu.permission.off": "输入监控权限：未开启…",
        "menu.login": "登录时启动",
        "menu.dataFolder": "打开数据文件夹",
        "menu.language": "语言",
        "menu.quit": "退出 KeyGlow",
        "language.system": "跟随系统",
        "language.en": "English",
        "language.zh": "简体中文",
        "state.recording": "正在记录",
        "state.paused": "已暂停",
        "state.waiting": "等待权限生效",
        "state.noPermission": "未授权",
        "tooltip.format": "KeyGlow · %@ · 今日 %@ 次按键",
        "alert.login.title": "无法设置登录时启动",
        "alert.login.body": "请先把「KeyGlow」移入「应用程序」文件夹，再到系统设置 › 通用 › 登录项中添加。\n\n%@",
        "alert.ok": "好",
    ]
}
