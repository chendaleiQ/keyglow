(() => {
  'use strict';

  const KEY = (label, codes, width, cls) => ({
    label,
    codes: Array.isArray(codes) ? codes : [codes],
    width,
    cls: cls || '',
  });
  const GAP = (width) => ({ spacer: true, width });

  const ROWS = [
    {
      items: [
        KEY('esc', 0x35, 1, 'word'),
        GAP(1),
        KEY('F1', 0x7a, 1), KEY('F2', 0x78, 1), KEY('F3', 0x63, 1), KEY('F4', 0x76, 1),
        GAP(0.5),
        KEY('F5', 0x60, 1), KEY('F6', 0x61, 1), KEY('F7', 0x62, 1), KEY('F8', 0x64, 1),
        GAP(0.5),
        KEY('F9', 0x65, 1), KEY('F10', 0x6d, 1), KEY('F11', 0x67, 1), KEY('F12', 0x6f, 1),
      ],
    },
    {
      items: [
        KEY('`', 0x32, 1),
        KEY('1', 0x12, 1), KEY('2', 0x13, 1), KEY('3', 0x14, 1), KEY('4', 0x15, 1),
        KEY('5', 0x17, 1), KEY('6', 0x16, 1), KEY('7', 0x1a, 1), KEY('8', 0x1c, 1),
        KEY('9', 0x19, 1), KEY('0', 0x1d, 1),
        KEY('-', 0x1b, 1), KEY('=', 0x18, 1),
        KEY('delete', 0x33, 2, 'word'),
      ],
    },
    {
      items: [
        KEY('tab', 0x30, 1.5, 'word'),
        KEY('Q', 0x0c, 1), KEY('W', 0x0d, 1), KEY('E', 0x0e, 1), KEY('R', 0x0f, 1),
        KEY('T', 0x11, 1), KEY('Y', 0x10, 1), KEY('U', 0x20, 1), KEY('I', 0x22, 1),
        KEY('O', 0x1f, 1), KEY('P', 0x23, 1), KEY('[', 0x21, 1), KEY(']', 0x1e, 1),
        KEY('\\', 0x2a, 1.5),
      ],
    },
    {
      items: [
        KEY('caps', 0x39, 1.75, 'word'),
        KEY('A', 0x00, 1), KEY('S', 0x01, 1), KEY('D', 0x02, 1), KEY('F', 0x03, 1),
        KEY('G', 0x05, 1), KEY('H', 0x04, 1), KEY('J', 0x26, 1), KEY('K', 0x28, 1),
        KEY('L', 0x25, 1), KEY(';', 0x29, 1), KEY("'", 0x27, 1),
        KEY('return', 0x24, 2.25, 'word'),
      ],
    },
    {
      items: [
        KEY('shift', 0x38, 2.25, 'word'),
        KEY('Z', 0x06, 1), KEY('X', 0x07, 1), KEY('C', 0x08, 1), KEY('V', 0x09, 1),
        KEY('B', 0x0b, 1), KEY('N', 0x2d, 1), KEY('M', 0x2e, 1), KEY(',', 0x2b, 1),
        KEY('.', 0x2f, 1), KEY('/', 0x2c, 1),
        KEY('shift', 0x3c, 2.75, 'word'),
      ],
    },
    {
      items: [
        KEY('fn', 0x3f, 1, 'word'),
        KEY('ctrl', 0x3b, 1, 'word'),
        KEY('opt', 0x3a, 1, 'word'),
        KEY('cmd', 0x37, 1.2, 'word'),
        KEY('space', 0x31, 4.6, 'word'),
        KEY('cmd', 0x36, 1.2, 'word'),
        KEY('opt', 0x3d, 1, 'word'),
        GAP(0.4),
        KEY('←', 0x7b, 0.9), KEY('↑', 0x7e, 0.9), KEY('↓', 0x7d, 0.9), KEY('→', 0x7c, 0.9),
      ],
    },
  ];

  const STRINGS = {
    en: {
      'language.system': 'System language',
      'aria.language': 'Language',
      'aria.summary': 'Activity summary',
      'aria.range': 'Time range',
      'aria.keyboard': 'Keyboard heatmap',
      'range.today': 'Today',
      'range.7d': '7 days',
      'range.all': 'All',
      'rangeLabel.today': 'Today',
      'rangeLabel.7d': 'Last 7 days',
      'rangeLabel.all': 'All time',
      'status.connecting': 'Connecting…',
      'status.recording': 'Recording',
      'status.paused': 'Paused',
      'status.noPermission': 'Not authorized',
      'status.waiting': 'Waiting',
      'permission.title': 'Input Monitoring required',
      'permission.text': 'Allow KeyGlow to read global key and mouse events. Only counts and coordinates are stored.',
      'permission.openSettings': 'Open Settings',
      'permission.grant': 'Grant Permission',
      'permission.waiting.title': 'Permission granted, listener inactive',
      'permission.waiting.text': 'Restart KeyGlow to start recording.',
      'permission.restart': 'Restart App',
      'stat.keys': 'Key presses',
      'stat.clicks': 'Clicks',
      'stat.distance': 'Distance',
      'stat.speed': 'Typing speed',
      'unit.m': 'm',
      'unit.km': 'km',
      'unit.perMinute': 'keys/min',
      'stats.keysSubOne': '{range} · 1 key tracked',
      'stats.keysSubMany': '{range} · {count} keys tracked',
      'stats.clicksSubNone': '{range} · No clicks',
      'stats.clicksSub': '{range} · Left {left} / Right {right}',
      'stats.clicksSubOther': '{range} · Left {left} / Right {right} / Other {other}',
      'stats.scrollOne': '{range} · 1 scroll',
      'stats.scrollMany': '{range} · {count} scrolls',
      'stats.speedLive': 'Last 60 seconds · Live',
      'stats.speedPaused': 'Last 60 seconds · Paused',
      'stats.speedIdle': 'Last 60 seconds',
      'panel.keyboard': 'Keyboard',
      'panel.mouse': 'Mouse',
      'meta.keyboardOne': '{range} · 1 press',
      'meta.keyboardMany': '{range} · {count} presses',
      'meta.mouse': '{range} · {displays}',
      'view.movement': 'Movement',
      'view.clicks': 'Clicks',
      'samples.one': '1 sample',
      'samples.many': '{count} samples',
      'clicks.one': '1 click',
      'clicks.many': '{count} clicks',
      'display.one': '1 display',
      'display.many': '{count} displays',
      'legend.less': 'Less',
      'legend.more': 'More',
      'empty.move': 'Move the pointer to draw a heatmap',
      'empty.click': 'Click to see where clicks land',
      'empty.noPermission': 'Grant Input Monitoring to record pointer activity',
      'empty.waiting': 'Waiting for the listener to start',
      'empty.paused': 'Recording paused',
      'foot.privacy': 'Stored locally · No input content recorded',
      'foot.openData': 'Open Data Folder',
      'tooltip.key': 'Key {key}',
      'tooltip.pressOne': '1 press · {percent}%',
      'tooltip.presses': '{count} presses · {percent}%',
      'tooltip.none': 'No data yet',
      'display.builtin': 'Built-in display',
      'display.main': 'Main display',
      'display.external': 'Display {index}',
    },
    zh: {
      'language.system': '跟随系统',
      'aria.language': '语言',
      'aria.summary': '活动概览',
      'aria.range': '时间范围',
      'aria.keyboard': '键盘按键热力图',
      'range.today': '今日',
      'range.7d': '近 7 天',
      'range.all': '全部',
      'rangeLabel.today': '今日',
      'rangeLabel.7d': '近 7 天',
      'rangeLabel.all': '全部记录',
      'status.connecting': '连接中…',
      'status.recording': '正在记录',
      'status.paused': '已暂停',
      'status.noPermission': '未授权',
      'status.waiting': '等待权限',
      'permission.title': '需要“输入监控”权限',
      'permission.text': 'macOS 只允许经你授权的应用读取全局按键与鼠标事件。仅保存次数和坐标。',
      'permission.openSettings': '打开系统设置',
      'permission.grant': '授予权限',
      'permission.waiting.title': '已授权，但监听尚未生效',
      'permission.waiting.text': '重启 KeyGlow 后即可开始记录。',
      'permission.restart': '重启应用',
      'stat.keys': '按键次数',
      'stat.clicks': '鼠标点击',
      'stat.distance': '鼠标移动',
      'stat.speed': '当前速度',
      'unit.m': '米',
      'unit.km': '公里',
      'unit.perMinute': '键/分',
      'stats.keysSubOne': '{range} · 1 个按键有记录',
      'stats.keysSubMany': '{range} · {count} 个按键有记录',
      'stats.clicksSubNone': '{range} · 暂无点击记录',
      'stats.clicksSub': '{range} · 左 {left} / 右 {right}',
      'stats.clicksSubOther': '{range} · 左 {left} / 右 {right} / 其他 {other}',
      'stats.scrollOne': '{range} · 滚轮 1 次',
      'stats.scrollMany': '{range} · 滚轮 {count} 次',
      'stats.speedLive': '最近 60 秒 · 实时',
      'stats.speedPaused': '最近 60 秒 · 已暂停',
      'stats.speedIdle': '最近 60 秒',
      'panel.keyboard': '键盘',
      'panel.mouse': '鼠标',
      'meta.keyboardOne': '{range} · 共 1 次按键',
      'meta.keyboardMany': '{range} · 共 {count} 次按键',
      'meta.mouse': '{range} · {displays}',
      'view.movement': '移动',
      'view.clicks': '点击',
      'samples.one': '1 个采样点',
      'samples.many': '{count} 个采样点',
      'clicks.one': '1 次点击',
      'clicks.many': '{count} 次点击',
      'display.one': '1 块屏幕',
      'display.many': '{count} 块屏幕',
      'legend.less': '少',
      'legend.more': '多',
      'empty.move': '移动鼠标后显示热力图',
      'empty.click': '点击鼠标后显示分布',
      'empty.noPermission': '授予“输入监控”权限后开始记录',
      'empty.waiting': '等待监听生效',
      'empty.paused': '记录已暂停',
      'foot.privacy': '仅本机保存 · 不记录输入内容',
      'foot.openData': '打开数据文件夹',
      'tooltip.key': '按键 {key}',
      'tooltip.pressOne': '1 次 · 占 {percent}%',
      'tooltip.presses': '{count} 次 · 占 {percent}%',
      'tooltip.none': '暂无记录',
      'display.builtin': '内建显示器',
      'display.main': '主显示器',
      'display.external': '外接显示器 {index}',
    },
  };

  const state = {
    days: {},
    displays: [],
    displayAspect: 1.6,
    gridCols: 60,
    gridRows: 36,
    today: localDateKey(new Date()),
    status: 'connecting',
    paused: false,
    apm: 0,
    range: 'today',
    language: (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en',
  };

  const refs = {
    languageSelect: document.getElementById('languageSelect'),
    keyboard: document.getElementById('keyboard'),
    keyboardWrap: document.querySelector('.keyboard-wrap'),
    statusPill: document.getElementById('statusPill'),
    statusText: document.getElementById('statusText'),
    statKeys: document.getElementById('statKeys'),
    statKeysSub: document.getElementById('statKeysSub'),
    statClicks: document.getElementById('statClicks'),
    statClicksSub: document.getElementById('statClicksSub'),
    statDistance: document.getElementById('statDistance'),
    statDistanceUnit: document.getElementById('statDistanceUnit'),
    statDistanceSub: document.getElementById('statDistanceSub'),
    statAPM: document.getElementById('statAPM'),
    statAPMUnit: document.getElementById('statAPMUnit'),
    statAPMSub: document.getElementById('statAPMSub'),
    keyboardMeta: document.getElementById('keyboardMeta'),
    mouseMeta: document.getElementById('mouseMeta'),
    moveStage: document.getElementById('moveStage'),
    moveCanvas: document.getElementById('moveCanvas'),
    moveEmpty: document.getElementById('moveEmpty'),
    moveMeta: document.getElementById('moveMeta'),
    clickStage: document.getElementById('clickStage'),
    clickCanvas: document.getElementById('clickCanvas'),
    clickEmpty: document.getElementById('clickEmpty'),
    clickMeta: document.getElementById('clickMeta'),
    banner: document.getElementById('permissionBanner'),
    bannerTitle: document.getElementById('bannerTitle'),
    bannerText: document.getElementById('bannerText'),
    bannerPrimary: document.getElementById('bannerPrimary'),
    bannerSecondary: document.getElementById('bannerSecondary'),
    tooltip: document.getElementById('tooltip'),
    openDataFolder: document.getElementById('openDataFolder'),
  };

  let rows = [];
  let slots = [];
  let lastAgg = null;
  let resizeFrame = 0;

  function t(key, values) {
    const table = STRINGS[state.language] || STRINGS.en;
    let text = table[key] || STRINGS.en[key] || key;
    if (values) {
      text = text.replace(/\{(\w+)\}/g, (match, name) => (
        Object.prototype.hasOwnProperty.call(values, name) ? values[name] : ''
      ));
    }
    return text;
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function fullNumber(value) {
    return Math.round(value || 0).toLocaleString(state.language === 'zh' ? 'zh-CN' : 'en-US');
  }

  function compact(value) {
    const n = Math.round(value || 0);
    if (n < 1000) return String(n);
    if (state.language === 'zh') {
      if (n < 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
      return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}万`;
    }
    if (n < 1000000) {
      return `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}k`;
    }
    return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`;
  }

  function applyLanguage() {
    state.language = state.language === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (key) element.textContent = t(key);
    });
    const rangeGroup = document.querySelector('.segmented');
    if (rangeGroup) rangeGroup.setAttribute('aria-label', t('aria.range'));
    if (refs.keyboard) refs.keyboard.setAttribute('aria-label', t('aria.keyboard'));
    refs.languageSelect.setAttribute('aria-label', t('aria.language'));
    document.querySelector('.stats').setAttribute('aria-label', t('aria.summary'));
    hideTooltip();
  }

  function bridge(action) {
    const handler = window.webkit?.messageHandlers?.inputheat;
    if (handler) {
      handler.postMessage({ action });
    }
  }

  function buildKeyboard() {
    rows = ROWS.map((row) => {
      let x = 0;
      const keys = [];
      for (const item of row.items) {
        if (item.spacer) {
          x += item.width;
          continue;
        }
        keys.push({ ...item, x });
        x += item.width;
      }
      return { keys };
    });

    refs.keyboard.replaceChildren();
    slots = [];

    for (const row of rows) {
      const rowEl = document.createElement('div');
      rowEl.className = 'krow';

      for (const key of row.keys) {
        const el = document.createElement('div');
        el.className = `key is-empty${key.cls ? ` ${key.cls}` : ''}`;
        const label = document.createElement('span');
        label.className = 'k-label';
        label.textContent = key.label;
        const count = document.createElement('span');
        count.className = 'k-count';
        el.append(label, count);
        el.addEventListener('pointerenter', (event) => showTooltip(key, event));
        el.addEventListener('pointermove', positionTooltip);
        el.addEventListener('pointerleave', hideTooltip);
        rowEl.appendChild(el);
        key.el = el;
        slots.push({ key, el, countEl: count, value: 0 });
      }

      refs.keyboard.appendChild(rowEl);
    }

    layoutKeyboard();
  }

  function layoutKeyboard() {
    const width = refs.keyboard.clientWidth;
    if (!width) return;
    const unit = width / 15;
    refs.keyboard.style.setProperty('--u', `${unit}px`);
    for (const row of rows) {
      for (const key of row.keys) {
        const gap = Math.max(2.5, Math.min(5, unit * 0.06));
        key.el.style.left = `${key.x * unit + gap / 2}px`;
        key.el.style.width = `${key.width * unit - gap}px`;
      }
    }
  }

  function showTooltip(key, event) {
    const slot = slots.find((candidate) => candidate.key === key);
    if (!slot || !lastAgg) return;
    const total = Object.values(lastAgg.keys).reduce((sum, value) => sum + value, 0);
    const percentage = total > 0 ? (slot.value / total) * 100 : 0;
    const title = document.createElement('strong');
    title.textContent = key.label.length === 1 ? t('tooltip.key', { key: key.label }) : key.label;
    const detail = document.createElement('span');
    detail.textContent = slot.value > 0
      ? (slot.value === 1
        ? t('tooltip.pressOne', { percent: percentage.toFixed(1) })
        : t('tooltip.presses', { count: fullNumber(slot.value), percent: percentage.toFixed(1) }))
      : t('tooltip.none');
    refs.tooltip.replaceChildren(title, detail);
    refs.tooltip.hidden = false;
    positionTooltip(event);
  }

  function positionTooltip(event) {
    if (refs.tooltip.hidden) return;
    const rect = refs.tooltip.getBoundingClientRect();
    const half = rect.width / 2;
    const x = Math.max(half + 10, Math.min(window.innerWidth - half - 10, event.clientX));
    refs.tooltip.classList.toggle('below', event.clientY < 100);
    refs.tooltip.style.left = `${x}px`;
    refs.tooltip.style.top = `${event.clientY}px`;
  }

  function hideTooltip() {
    refs.tooltip.hidden = true;
  }

  function rangeDates() {
    if (state.range === 'all') {
      return Object.keys(state.days);
    }
    if (state.range === 'today') {
      return [state.today || localDateKey(new Date())];
    }
    const dates = [];
    const now = new Date();
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      dates.push(localDateKey(date));
    }
    return dates;
  }

  function rangeLabel() {
    return t(`rangeLabel.${state.range}`);
  }

  function aggregate(dates) {
    const agg = {
      keys: {},
      move: {},
      click: {},
      left: 0,
      right: 0,
      other: 0,
      scroll: 0,
      distance: 0,
    };

    for (const date of dates) {
      const day = state.days[date];
      if (!day) continue;

      for (const [code, raw] of Object.entries(day.keys || {})) {
        const value = Number(raw) || 0;
        if (value > 0) agg.keys[code] = (agg.keys[code] || 0) + value;
      }
      for (const [cell, raw] of Object.entries(day.moveGrid || {})) {
        const value = Number(raw) || 0;
        if (value > 0) agg.move[cell] = (agg.move[cell] || 0) + value;
      }
      for (const [cell, raw] of Object.entries(day.clickGrid || {})) {
        const value = Number(raw) || 0;
        if (value > 0) agg.click[cell] = (agg.click[cell] || 0) + value;
      }
      agg.left += Number(day.left) || 0;
      agg.right += Number(day.right) || 0;
      agg.other += Number(day.other) || 0;
      agg.scroll += Number(day.scroll) || 0;
      agg.distance += Number(day.distance) || 0;
    }

    return agg;
  }

  function renderAll() {
    const agg = aggregate(rangeDates());
    lastAgg = agg;
    renderStats(agg);
    renderKeyboard(agg);
    renderMouseViews(agg);
    renderStatus();
  }

  function renderStats(agg) {
    const label = rangeLabel();
    const totalKeys = Object.values(agg.keys).reduce((sum, value) => sum + value, 0);
    const distinctKeys = Object.values(agg.keys).filter((value) => value > 0).length;
    const totalClicks = agg.left + agg.right + agg.other;

    refs.statKeys.textContent = fullNumber(totalKeys);
    refs.statKeysSub.textContent = distinctKeys === 1
      ? t('stats.keysSubOne', { range: label })
      : t('stats.keysSubMany', { range: label, count: fullNumber(distinctKeys) });

    refs.statClicks.textContent = fullNumber(totalClicks);
    if (totalClicks === 0) {
      refs.statClicksSub.textContent = t('stats.clicksSubNone', { range: label });
    } else if (agg.other > 0) {
      refs.statClicksSub.textContent = t('stats.clicksSubOther', {
        range: label,
        left: compact(agg.left),
        right: compact(agg.right),
        other: compact(agg.other),
      });
    } else {
      refs.statClicksSub.textContent = t('stats.clicksSub', {
        range: label,
        left: compact(agg.left),
        right: compact(agg.right),
      });
    }

    const meters = agg.distance * 0.0002646;
    if (meters >= 1000) {
      refs.statDistance.textContent = (meters / 1000).toFixed(2);
      refs.statDistanceUnit.textContent = t('unit.km');
    } else if (meters >= 100) {
      refs.statDistance.textContent = meters.toFixed(0);
      refs.statDistanceUnit.textContent = t('unit.m');
    } else {
      refs.statDistance.textContent = meters.toFixed(1);
      refs.statDistanceUnit.textContent = t('unit.m');
    }
    refs.statDistanceSub.textContent = agg.scroll === 1
      ? t('stats.scrollOne', { range: label })
      : t('stats.scrollMany', { range: label, count: fullNumber(agg.scroll) });

    refs.statAPM.textContent = fullNumber(state.apm);
    refs.statAPMUnit.textContent = t('unit.perMinute');
    refs.statAPMSub.textContent = state.status === 'paused'
      ? t('stats.speedPaused')
      : state.status === 'monitoring'
        ? t('stats.speedLive')
        : t('stats.speedIdle');

    refs.keyboardMeta.textContent = totalKeys === 1
      ? t('meta.keyboardOne', { range: label })
      : t('meta.keyboardMany', { range: label, count: fullNumber(totalKeys) });
  }

  function renderKeyboard(agg) {
    const values = slots.map((slot) => {
      let value = 0;
      for (const code of slot.key.codes) {
        value += agg.keys[String(code)] || 0;
      }
      return value;
    });
    const max = values.reduce((best, value) => Math.max(best, value), 0);

    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index];
      const value = values[index];
      slot.value = value;
      slot.countEl.textContent = value > 0 ? compact(value) : '';
      slot.el.classList.toggle('is-empty', value === 0);

      if (value === 0 || max === 0) {
        slot.el.style.background = '';
        slot.el.style.borderColor = '';
        slot.el.classList.remove('lit');
        continue;
      }

      const ratio = Math.pow(value / max, 0.55);
      const alpha = 0.12 + ratio * 0.8;
      slot.el.style.background = `rgba(var(--heat-rgb), ${alpha.toFixed(3)})`;
      slot.el.style.borderColor = `rgba(var(--heat-rgb), ${(0.18 + ratio * 0.45).toFixed(3)})`;
      slot.el.classList.add('lit');
    }
  }

  function renderMouseViews(agg) {
    const moveSamples = Object.values(agg.move).reduce((sum, value) => sum + value, 0);
    const clicks = agg.left + agg.right + agg.other;
    const displayCount = Math.max(1, state.displays.length);
    const displays = displayCount === 1
      ? t('display.one')
      : t('display.many', { count: fullNumber(displayCount) });

    refs.mouseMeta.textContent = t('meta.mouse', { range: rangeLabel(), displays });
    refs.moveMeta.textContent = moveSamples === 1
      ? t('samples.one')
      : t('samples.many', { count: fullNumber(moveSamples) });
    refs.clickMeta.textContent = clicks === 1
      ? t('clicks.one')
      : t('clicks.many', { count: fullNumber(clicks) });

    drawHeatMap(refs.moveCanvas, refs.moveStage, refs.moveEmpty, agg.move, false);
    drawHeatMap(refs.clickCanvas, refs.clickStage, refs.clickEmpty, agg.click, true);
  }

  function emptyMessage(isClick) {
    if (state.status === 'noPermission') return t('empty.noPermission');
    if (state.status === 'waiting') return t('empty.waiting');
    if (state.status === 'paused') return t('empty.paused');
    return isClick ? t('empty.click') : t('empty.move');
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function prepareCanvas(canvas, stage) {
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function displayLabel(display) {
    if (!display) return '';
    if (display.kind === 'builtin') return t('display.builtin');
    if (display.kind === 'main') return t('display.main');
    if (display.kind === 'external') return t('display.external', { index: display.index || '' });
    return display.label || '';
  }

  function boxBlur(source, cols, rows, radius) {
    const temp = new Float32Array(source.length);
    const out = new Float32Array(source.length);
    const diameter = radius * 2 + 1;

    for (let y = 0; y < rows; y += 1) {
      const offset = y * cols;
      for (let x = 0; x < cols; x += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          const xx = Math.min(cols - 1, Math.max(0, x + k));
          sum += source[offset + xx];
        }
        temp[offset + x] = sum / diameter;
      }
    }

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        let sum = 0;
        for (let k = -radius; k <= radius; k += 1) {
          const yy = Math.min(rows - 1, Math.max(0, y + k));
          sum += temp[yy * cols + x];
        }
        out[y * cols + x] = sum / diameter;
      }
    }

    return out;
  }

  function sampleField(field, cols, rows, x, y) {
    const cx = Math.min(cols - 1, Math.max(0, x));
    const cy = Math.min(rows - 1, Math.max(0, y));
    const x0 = Math.floor(cx);
    const y0 = Math.floor(cy);
    const x1 = Math.min(cols - 1, x0 + 1);
    const y1 = Math.min(rows - 1, y0 + 1);
    const tx = cx - x0;
    const ty = cy - y0;

    const top = field[y0 * cols + x0] * (1 - tx) + field[y0 * cols + x1] * tx;
    const bottom = field[y1 * cols + x0] * (1 - tx) + field[y1 * cols + x1] * tx;
    return top * (1 - ty) + bottom * ty;
  }

  function drawHeatMap(canvas, stage, emptyEl, grid, isClick) {
    const { ctx, width, height } = prepareCanvas(canvas, stage);
    const styles = getComputedStyle(document.documentElement);
    const mapBorder = styles.getPropertyValue('--map-border').trim() || 'rgba(0,0,0,.16)';
    const mapBorderStrong = styles.getPropertyValue('--map-border-strong').trim() || mapBorder;
    const mapFill = styles.getPropertyValue('--map-fill').trim() || 'transparent';
    const mapText = styles.getPropertyValue('--tertiary').trim() || '#8a8a8e';
    const heatRgb = styles.getPropertyValue('--heat-rgb').trim() || '255,149,0';

    const aspect = state.displayAspect > 0 ? state.displayAspect : 1.6;
    const padding = 12;
    let fitWidth = width - padding * 2;
    let fitHeight = height - padding * 2;
    if (fitWidth / fitHeight > aspect) {
      fitWidth = fitHeight * aspect;
    } else {
      fitHeight = fitWidth / aspect;
    }
    const fitX = (width - fitWidth) / 2;
    const fitY = (height - fitHeight) / 2;

    const displays = state.displays.length > 0
      ? state.displays
      : [{ x: 0, y: 0, w: 1, h: 1, kind: 'main', label: '', main: true }];

    for (const display of displays) {
      const x = fitX + display.x * fitWidth;
      const y = fitY + display.y * fitHeight;
      const w = display.w * fitWidth;
      const h = display.h * fitHeight;
      roundedRect(ctx, x, y, w, h, 7);
      ctx.fillStyle = mapFill;
      ctx.fill();
    }

    ctx.save();
    roundedRect(ctx, fitX, fitY, fitWidth, fitHeight, 7);
    ctx.clip();

    const cols = state.gridCols;
    const rows = state.gridRows;
    const field = new Float32Array(cols * rows);
    let max = 0;

    for (const [cell, raw] of Object.entries(grid)) {
      const [col, row] = cell.split(',').map(Number);
      if (!Number.isFinite(col) || !Number.isFinite(row)) continue;
      if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
      const value = Number(raw) || 0;
      if (value > max) max = value;
      field[row * cols + col] += value;
    }

    if (max > 0) {
      for (let index = 0; index < field.length; index += 1) {
        field[index] /= max;
      }
      const smoothed = boxBlur(field, cols, rows, 1);

      let smoothMax = 0;
      for (const value of smoothed) {
        if (value > smoothMax) smoothMax = value;
      }
      if (smoothMax > 0) {
        for (let index = 0; index < smoothed.length; index += 1) {
          smoothed[index] /= smoothMax;
        }
      }

      const heatParts = heatRgb.split(',').map((part) => Number(part.trim()));
      const heatR = Number.isFinite(heatParts[0]) ? heatParts[0] : 255;
      const heatG = Number.isFinite(heatParts[1]) ? heatParts[1] : 149;
      const heatB = Number.isFinite(heatParts[2]) ? heatParts[2] : 0;

      const scale = 6;
      const heat = document.createElement('canvas');
      heat.width = cols * scale;
      heat.height = rows * scale;
      const heatCtx = heat.getContext('2d');
      const image = heatCtx.createImageData(heat.width, heat.height);
      const data = image.data;
      let pixel = 0;

      for (let py = 0; py < heat.height; py += 1) {
        const fy = (py + 0.5) / scale - 0.5;
        for (let px = 0; px < heat.width; px += 1) {
          const fx = (px + 0.5) / scale - 0.5;
          let value = sampleField(smoothed, cols, rows, fx, fy);
          value = (value - 0.08) / 0.92;
          value = Math.max(0, Math.min(1, value));
          const alpha = Math.pow(value, 1.7) * 0.9;
          data[pixel] = heatR;
          data[pixel + 1] = heatG;
          data[pixel + 2] = heatB;
          data[pixel + 3] = Math.round(alpha * 255);
          pixel += 4;
        }
      }

      heatCtx.putImageData(image, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 1;
      if ('filter' in ctx) ctx.filter = 'blur(0.5px)';
      ctx.drawImage(heat, fitX, fitY, fitWidth, fitHeight);
      if ('filter' in ctx) ctx.filter = 'none';
    }

    ctx.restore();

    ctx.font = '10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    for (const display of displays) {
      const x = fitX + display.x * fitWidth;
      const y = fitY + display.y * fitHeight;
      const w = display.w * fitWidth;
      const h = display.h * fitHeight;
      roundedRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 7);
      ctx.strokeStyle = display.main ? mapBorderStrong : mapBorder;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      const label = displayLabel(display);
      if (label && w > 110 && h > 40) {
        ctx.fillStyle = mapText;
        ctx.fillText(label, x + 8, y + 14);
      }
    }

    const hasHeat = max > 0;
    emptyEl.hidden = hasHeat;
    if (!hasHeat) {
      emptyEl.textContent = emptyMessage(isClick);
    }
  }

  function renderStatus() {
    const statusClass = state.status === 'monitoring' ? 'recording' : state.status;
    refs.statusPill.className = `status ${statusClass}`;
    refs.statusPill.classList.toggle(
      'static',
      state.status === 'connecting' || state.status === 'waiting'
    );
    refs.statusText.textContent = t(`status.${statusClass}`);

    const showBanner = state.status === 'noPermission' || state.status === 'waiting';
    refs.banner.hidden = !showBanner;
    document.body.classList.toggle('has-banner', showBanner);

    if (showBanner) {
      if (state.status === 'waiting') {
        refs.bannerTitle.textContent = t('permission.waiting.title');
        refs.bannerText.textContent = t('permission.waiting.text');
        refs.bannerPrimary.textContent = t('permission.restart');
      } else {
        refs.bannerTitle.textContent = t('permission.title');
        refs.bannerText.textContent = t('permission.text');
        refs.bannerPrimary.textContent = t('permission.grant');
      }
      refs.bannerSecondary.hidden = false;
      refs.bannerSecondary.textContent = t('permission.openSettings');
    }
  }

  function ingest(payload) {
    if (!payload || typeof payload !== 'object') return;
    if (payload.language === 'zh' || payload.language === 'en') {
      if (state.language !== payload.language) {
        state.language = payload.language;
        applyLanguage();
      }
    }
    if (['system', 'en', 'zh'].includes(payload.languagePreference)) {
      refs.languageSelect.value = payload.languagePreference;
    }
    if (payload.full) {
      state.days = payload.days || {};
    } else if (payload.days) {
      for (const [date, day] of Object.entries(payload.days)) {
        state.days[date] = day;
      }
    }
    if (payload.displays) state.displays = payload.displays;
    if (typeof payload.displayAspect === 'number') state.displayAspect = payload.displayAspect;
    if (payload.gridCols) state.gridCols = Number(payload.gridCols) || state.gridCols;
    if (payload.gridRows) state.gridRows = Number(payload.gridRows) || state.gridRows;
    if (payload.today) state.today = payload.today;
    if (typeof payload.apm === 'number') state.apm = payload.apm;
    if (payload.status) state.status = payload.status;
    state.paused = Boolean(payload.paused);
    renderAll();
  }

  function bindUI() {
    refs.languageSelect.addEventListener('change', () => {
      bridge(`language:${refs.languageSelect.value}`);
    });
    document.querySelectorAll('[data-range]').forEach((button) => {
      button.addEventListener('click', () => {
        state.range = button.dataset.range;
        document.querySelectorAll('[data-range]').forEach((candidate) => {
          candidate.classList.toggle('active', candidate === button);
        });
        renderAll();
      });
    });

    refs.statusPill.addEventListener('click', () => {
      if (state.status === 'monitoring' || state.status === 'paused') {
        bridge('togglePause');
      } else if (state.status === 'noPermission') {
        bridge('requestPermission');
      }
    });

    refs.bannerPrimary.addEventListener('click', () => {
      bridge(state.status === 'waiting' ? 'restartApp' : 'requestPermission');
    });
    refs.bannerSecondary.addEventListener('click', () => {
      bridge('openPermissionSettings');
    });
    refs.openDataFolder.addEventListener('click', () => {
      bridge('openDataFolder');
    });

    window.addEventListener('scroll', hideTooltip, true);
    refs.keyboardWrap.addEventListener('scroll', hideTooltip, { passive: true });

    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const redraw = () => {
      if (lastAgg) renderMouseViews(lastAgg);
    };
    if (colorScheme.addEventListener) {
      colorScheme.addEventListener('change', redraw);
    } else if (colorScheme.addListener) {
      colorScheme.addListener(redraw);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        layoutKeyboard();
        if (lastAgg) renderMouseViews(lastAgg);
      });
    });
    resizeObserver.observe(refs.keyboard);
    resizeObserver.observe(refs.moveStage);
    resizeObserver.observe(refs.clickStage);
  }

  function boot() {
    applyLanguage();
    buildKeyboard();
    bindUI();
    window.inputHeatRender = ingest;
    if (window.__INPUTHEAT_PREVIEW__) {
      ingest(window.__INPUTHEAT_PREVIEW__);
    } else {
      renderAll();
      bridge('ready');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
