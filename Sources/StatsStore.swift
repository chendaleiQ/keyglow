import CoreGraphics
import Foundation

struct DayStats: Codable {
    var keys: [String: Int] = [:]
    var moveGrid: [String: Int] = [:]
    var clickGrid: [String: Int] = [:]
    var leftClicks = 0
    var rightClicks = 0
    var otherClicks = 0
    var scrollEvents = 0
    var mouseDistance: Double = 0
}

struct StatsFile: Codable {
    var version = 1
    var days: [String: DayStats] = [:]
}

final class StatsStore {
    static let gridColumns = 60
    static let gridRows = 36
    static let dataDirectory: URL = {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        return base.appendingPathComponent("InputHeat", isDirectory: true)
    }()

    private let fileURL: URL
    private var file = StatsFile()
    private(set) var todayKey = ""
    private var recentKeyTimes: [TimeInterval] = []
    private var dirty = false
    private var displayInfos: [[String: Any]] = []
    private var displayAspect: Double = 1.6
    private var unionRect: CGRect = .zero
    private let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    init() {
        fileURL = Self.dataDirectory.appendingPathComponent("stats.json")
        try? FileManager.default.createDirectory(at: Self.dataDirectory, withIntermediateDirectories: true)
        load()
        todayKey = dayFormatter.string(from: Date())
        refreshDisplays()
    }

    var todaySummary: (keys: Int, clicks: Int) {
        let day = file.days[todayKey] ?? DayStats()
        return (
            day.keys.values.reduce(0, +),
            day.leftClicks + day.rightClicks + day.otherClicks
        )
    }

    func refreshDayIfNeeded() {
        let key = dayFormatter.string(from: Date())
        guard key != todayKey else { return }
        todayKey = key
        dirty = true
    }

    func recordKey(_ keyCode: Int) {
        file.days[todayKey, default: DayStats()].keys[String(keyCode), default: 0] += 1
        let now = Date().timeIntervalSince1970
        recentKeyTimes.append(now)
        if recentKeyTimes.count > 2_000 {
            recentKeyTimes.removeAll { $0 < now - 60 }
        }
        dirty = true
    }

    func recordClick(button: Int, at point: CGPoint) {
        var day = file.days[todayKey, default: DayStats()]
        switch button {
        case 0: day.leftClicks += 1
        case 1: day.rightClicks += 1
        default: day.otherClicks += 1
        }
        if let cell = gridCell(for: point) {
            day.clickGrid[cell, default: 0] += 1
        }
        file.days[todayKey] = day
        dirty = true
    }

    func recordMouse(at point: CGPoint, distance: Double) {
        guard let cell = gridCell(for: point) else { return }
        var day = file.days[todayKey, default: DayStats()]
        day.moveGrid[cell, default: 0] += 1
        if distance.isFinite, distance > 0 {
            day.mouseDistance += distance
        }
        file.days[todayKey] = day
        dirty = true
    }

    func recordScroll() {
        file.days[todayKey, default: DayStats()].scrollEvents += 1
        dirty = true
    }

    func currentAPM() -> Int {
        let cutoff = Date().timeIntervalSince1970 - 60
        recentKeyTimes.removeAll { $0 < cutoff }
        return recentKeyTimes.count
    }

    func saveIfNeeded(force: Bool = false) {
        guard dirty || force else { return }
        do {
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            let data = try encoder.encode(file)
            try data.write(to: fileURL, options: .atomic)
            dirty = false
        } catch {
            NSLog("InputHeat: failed to save stats — %@", String(describing: error))
        }
    }

    func refreshDisplays() {
        var count: UInt32 = 0
        guard CGGetActiveDisplayList(0, nil, &count) == .success, count > 0 else { return }
        var ids = [CGDirectDisplayID](repeating: 0, count: Int(count))
        var actual: UInt32 = 0
        guard CGGetActiveDisplayList(count, &ids, &actual) == .success, actual > 0 else { return }
        ids = Array(ids.prefix(Int(actual)))

        let screens = ids
            .map { (id: $0, rect: CGDisplayBounds($0)) }
            .filter { !$0.rect.isEmpty }
            .sorted {
                if $0.rect.minX != $1.rect.minX { return $0.rect.minX < $1.rect.minX }
                return $0.rect.minY < $1.rect.minY
            }
        guard var union = screens.first?.rect else { return }
        for screen in screens.dropFirst() {
            union = union.union(screen.rect)
        }
        unionRect = union
        displayAspect = union.height > 0 ? Double(union.width / union.height) : 1.6

        let mainID = CGMainDisplayID()
        var externalIndex = 0
        var infos: [[String: Any]] = []
        for screen in screens {
            var label: String
            if CGDisplayIsBuiltin(screen.id) != 0 {
                label = "内建显示器"
            } else if screen.id == mainID {
                label = "主显示器"
            } else {
                externalIndex += 1
                label = "外接显示器 \(externalIndex)"
            }
            infos.append([
                "x": Double((screen.rect.minX - union.minX) / union.width),
                "y": Double((screen.rect.minY - union.minY) / union.height),
                "w": Double(screen.rect.width / union.width),
                "h": Double(screen.rect.height / union.height),
                "label": label,
                "main": screen.id == mainID,
            ])
        }
        displayInfos = infos
    }

    func payload(full: Bool) -> [String: Any] {
        refreshDayIfNeeded()
        let days: [String: Any]
        if full {
            days = file.days.mapValues(encodedDay)
        } else {
            days = [todayKey: encodedDay(file.days[todayKey] ?? DayStats())]
        }
        return [
            "full": full,
            "days": days,
            "displays": displayInfos,
            "displayAspect": displayAspect,
            "gridCols": Self.gridColumns,
            "gridRows": Self.gridRows,
            "apm": currentAPM(),
            "today": todayKey,
            "now": Date().timeIntervalSince1970,
        ]
    }

    private func encodedDay(_ day: DayStats) -> [String: Any] {
        [
            "keys": day.keys,
            "moveGrid": day.moveGrid,
            "clickGrid": day.clickGrid,
            "left": day.leftClicks,
            "right": day.rightClicks,
            "other": day.otherClicks,
            "scroll": day.scrollEvents,
            "distance": day.mouseDistance,
        ]
    }

    private func gridCell(for point: CGPoint) -> String? {
        guard unionRect.width > 0, unionRect.height > 0 else { return nil }
        let u = (point.x - unionRect.minX) / unionRect.width
        let v = (point.y - unionRect.minY) / unionRect.height
        guard u >= 0, u <= 1, v >= 0, v <= 1 else { return nil }
        let col = min(Self.gridColumns - 1, max(0, Int(u * CGFloat(Self.gridColumns))))
        let row = min(Self.gridRows - 1, max(0, Int(v * CGFloat(Self.gridRows))))
        return "\(col),\(row)"
    }

    private func load() {
        guard let data = try? Data(contentsOf: fileURL) else { return }
        guard let decoded = try? JSONDecoder().decode(StatsFile.self, from: data) else {
            NSLog("InputHeat: stats file could not be decoded, starting fresh")
            return
        }
        file = decoded
    }
}
