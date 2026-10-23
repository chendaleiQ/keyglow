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
      height: 29,
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
      height: 43,
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
      height: 43,
      items: [
        KEY('tab', 0x30, 1.5, 'word'),
        KEY('Q', 0x0c, 1), KEY('W', 0x0d, 1), KEY('E', 0x0e, 1), KEY('R', 0x0f, 1),
        KEY('T', 0x11, 1), KEY('Y', 0x10, 1), KEY('U', 0x20, 1), KEY('I', 0x22, 1),
        KEY('O', 0x1f, 1), KEY('P', 0x23, 1), KEY('[', 0x21, 1), KEY(']', 0x1e, 1),
        KEY('\\', 0x2a, 1.5),
      ],
    },
    {
      height: 43,
      items: [
        KEY('caps', 0x39, 1.75, 'word'),
        KEY('A', 0x00, 1), KEY('S', 0x01, 1), KEY('D', 0x02, 1), KEY('F', 0x03, 1),
        KEY('G', 0x05, 1), KEY('H', 0x04, 1), KEY('J', 0x26, 1), KEY('K', 0x28, 1),
        KEY('L', 0x25, 1), KEY(';', 0x29, 1), KEY("'", 0x27, 1),
        KEY('return', 0x24, 2.25, 'word'),
      ],
    },
    {
      height: 43,
      items: [
        KEY('shift', 0x38, 2.25, 'word'),
        KEY('Z', 0x06, 1), KEY('X', 0x07, 1), KEY('C', 0x08, 1), KEY('V', 0x09, 1),
        KEY('B', 0x0b, 1), KEY('N', 0x2d, 1), KEY('M', 0x2e, 1), KEY(',', 0x2b, 1),
        KEY('.', 0x2f, 1), KEY('/', 0x2c, 1),
        KEY('shift', 0x3c, 2.75, 'word'),
      ],
    },
    {
      height: 43,
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

  const HEAT_STOPS = [
    [0, [46, 27, 69]],
    [0.28, [108, 42, 99]],
    [0.55, [178, 59, 80]],
    [0.78, [239, 124, 61]],
    [1, [246, 200, 95]],
  ];

  const STATUS_TEXT = {
    connecting: '连接中',
    monitoring: '正在记录',
    paused: '已暂停',
    noPermission: '未授权',
    waiting: '等待权限生效',
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
  };

  const refs = {
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
    footerState: document.getElementById('footerState'),
    tooltip: document.getElementById('tooltip'),
    openDataFolder: document.getElementById('openDataFolder'),
  };

  let rows = [];
  let slots = [];
  let lastAgg = null;
  let resizeFrame = 0;

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function fullNumber(value) {
    return Math.round(value || 0).toLocaleString('zh-CN');
  }

  function compact(value) {
    const n = Math.round(value || 0);
    if (n < 1000) return String(n);
    if (n < 10000) {
      return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}万`;
  }

  function heatColor(t) {
    const clamped = Math.max(0, Math.min(1, t));
    for (let i = 0; i < HEAT_STOPS.length - 1; i += 1) {
      const [fromT, fromColor] = HEAT_STOPS[i];
      const [toT, toColor] = HEAT_STOPS[i + 1];
      if (clamped <= toT) {
        const f = (clamped - fromT) / (toT - fromT);
        return fromColor.map((channel, index) => Math.round(channel + (toColor[index] - channel) * f));
      }
    }
    return HEAT_STOPS[HEAT_STOPS.length - 1][1];
  }

  function luminance(color) {
    return (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
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
      return { height: row.height, keys };
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
    title.textContent = key.label.length === 1 ? `按键 ${key.label}` : key.label;
    const detail = document.createElement('span');
    detail.textContent = slot.value > 0
      ? `${fullNumber(slot.value)} 次 · 占 ${percentage.toFixed(1)}%`
      : '暂无记录';
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
    if (state.range === '7d') return '近 7 天';
    if (state.range === 'all') return '全部记录';
    return '今日';
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
    refs.statKeysSub.textContent = `${label} · ${distinctKeys} 个按键有记录`;

    refs.statClicks.textContent = fullNumber(totalClicks);
    if (totalClicks === 0) {
      refs.statClicksSub.textContent = `${label} · 暂无点击记录`;
    } else {
      const parts = [`左 ${compact(agg.left)}`, `右 ${compact(agg.right)}`];
      if (agg.other > 0) parts.push(`其他 ${compact(agg.other)}`);
      refs.statClicksSub.textContent = `${label} · ${parts.join(' / ')}`;
    }

    const meters = agg.distance * 0.0002646;
    if (meters >= 1000) {
      refs.statDistance.textContent = (meters / 1000).toFixed(2);
      refs.statDistanceUnit.textContent = '公里';
    } else if (meters >= 100) {
      refs.statDistance.textContent = meters.toFixed(0);
      refs.statDistanceUnit.textContent = '米';
    } else {
      refs.statDistance.textContent = meters.toFixed(1);
      refs.statDistanceUnit.textContent = '米';
    }
    refs.statDistanceSub.textContent = `${label} · 滚轮 ${fullNumber(agg.scroll)} 次`;

    refs.statAPM.textContent = fullNumber(state.apm);
    refs.statAPMSub.textContent = state.status === 'paused'
      ? '最近 60 秒 · 已暂停'
      : state.status === 'monitoring'
        ? '最近 60 秒 · 实时'
        : '最近 60 秒';

    refs.keyboardMeta.textContent = `${label} · 共 ${fullNumber(totalKeys)} 次按键`;
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

      if (value === 0) {
        slot.el.style.background = '';
        slot.el.style.borderColor = '';
        slot.el.style.color = '';
        slot.el.style.boxShadow = '';
        slot.el.classList.remove('accent');
        continue;
      }

      const t = Math.pow(value / max, 0.5);
      const color = heatColor(Math.max(0.18, t));
      const darkText = luminance(color) > 0.68;
      slot.el.style.background = `linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 58%), rgb(${color.join(',')})`;
      slot.el.style.borderColor = `rgba(255,255,255,${(0.1 + t * 0.18).toFixed(3)})`;
      slot.el.style.color = darkText ? 'rgba(30,19,9,.94)' : 'rgba(255,248,240,.95)';
      slot.el.style.boxShadow = `inset 0 -1px 0 rgba(0,0,0,.16), 0 0 ${Math.round(t * 15)}px rgba(${color.join(',')},${(0.08 + t * 0.16).toFixed(3)})`;
      slot.el.classList.toggle('accent', !darkText);
    }
  }

  function renderMouseViews(agg) {
    const moveSamples = Object.values(agg.move).reduce((sum, value) => sum + value, 0);
    const moveHotspots = Object.keys(agg.move).length;
    const clicks = agg.left + agg.right + agg.other;
    const clickHotspots = Object.keys(agg.click).length;
    const displayCount = Math.max(1, state.displays.length);

    refs.mouseMeta.textContent = `${rangeLabel()} · ${displayCount} 块屏幕`;
    refs.moveMeta.textContent = `${fullNumber(moveSamples)} 个采样点`;
    refs.moveMeta.title = `覆盖 ${moveHotspots} 个网格区域`;
    refs.clickMeta.textContent = `${fullNumber(clicks)} 次点击`;
    refs.clickMeta.title = `覆盖 ${clickHotspots} 个网格区域`;

    drawHeatMap(refs.moveCanvas, refs.moveStage, refs.moveEmpty, agg.move, false);
    drawHeatMap(refs.clickCanvas, refs.clickStage, refs.clickEmpty, agg.click, true);
  }

  function emptyMessage(isClick) {
    if (state.status === 'noPermission') return '授权“输入监控”后，鼠标轨迹会显示在这里';
    if (state.status === 'waiting') return '等待权限生效后开始绘制轨迹';
    if (state.status === 'paused') return '记录已暂停';
    return isClick ? '点击鼠标，分布会显示在这里' : '移动鼠标，热力图会在这里生长';
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

  function drawHeatMap(canvas, stage, emptyEl, grid, isClick) {
    const { ctx, width, height } = prepareCanvas(canvas, stage);

    const aspect = state.displayAspect > 0 ? state.displayAspect : 1.6;
    const padding = 15;
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
      : [{ x: 0, y: 0, w: 1, h: 1, label: '', main: true }];

    for (const display of displays) {
      const x = fitX + display.x * fitWidth;
      const y = fitY + display.y * fitHeight;
      const w = display.w * fitWidth;
      const h = display.h * fitHeight;
      roundedRect(ctx, x, y, w, h, 10);
      ctx.fillStyle = 'rgba(255,255,255,.014)';
      ctx.fill();
    }

    ctx.save();
    roundedRect(ctx, fitX, fitY, fitWidth, fitHeight, 10);
    ctx.clip();

    ctx.fillStyle = 'rgba(255,255,255,.05)';
    for (let x = fitX + 14; x < fitX + fitWidth; x += 26) {
      for (let y = fitY + 14; y < fitY + fitHeight; y += 26) {
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    }

    let max = 0;
    for (const value of Object.values(grid)) {
      if (value > max) max = value;
    }

    if (max > 0) {
      const heat = document.createElement('canvas');
      heat.width = state.gridCols;
      heat.height = state.gridRows;
      const heatCtx = heat.getContext('2d');
      heatCtx.clearRect(0, 0, heat.width, heat.height);

      for (const [cell, raw] of Object.entries(grid)) {
        const [col, row] = cell.split(',').map(Number);
        if (!Number.isFinite(col) || !Number.isFinite(row)) continue;
        if (col < 0 || col >= state.gridCols || row < 0 || row >= state.gridRows) continue;
        const t = Math.pow((Number(raw) || 0) / max, 0.55);
        const color = heatColor(Math.max(0.12, t));
        heatCtx.fillStyle = `rgba(${color.join(',')},${(0.08 + t * 0.92).toFixed(3)})`;
        heatCtx.fillRect(col, row, 1, 1);
      }

      ctx.globalCompositeOperation = 'lighter';
      ctx.imageSmoothingEnabled = true;
      if ('filter' in ctx) ctx.filter = 'blur(9px)';
      ctx.drawImage(heat, fitX, fitY, fitWidth, fitHeight);
      if ('filter' in ctx) ctx.filter = 'blur(1.5px)';
      ctx.globalAlpha = 0.7;
      ctx.drawImage(heat, fitX, fitY, fitWidth, fitHeight);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if ('filter' in ctx) ctx.filter = 'none';
    }

    ctx.restore();

    ctx.font = '10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    for (const display of displays) {
      const x = fitX + display.x * fitWidth;
      const y = fitY + display.y * fitHeight;
      const w = display.w * fitWidth;
      const h = display.h * fitHeight;
      roundedRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 10);
      ctx.strokeStyle = display.main ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (display.label && w > 120 && h > 46) {
        ctx.fillStyle = 'rgba(255,255,255,.33)';
        ctx.fillText(display.label, x + 10, y + 16);
      }
    }

    const hasHeat = max > 0;
    emptyEl.hidden = hasHeat;
    if (!hasHeat) {
      emptyEl.textContent = emptyMessage(isClick);
    }
  }

  function renderStatus() {
    refs.statusPill.className = `status-pill ${state.status}`;
    refs.statusPill.classList.toggle(
      'static',
      state.status === 'connecting' || state.status === 'waiting'
    );
    refs.statusText.textContent = STATUS_TEXT[state.status] || '连接中';

    const showBanner = state.status === 'noPermission' || state.status === 'waiting';
    refs.banner.hidden = !showBanner;
    document.body.classList.toggle('has-banner', showBanner);
    if (showBanner) {
      if (state.status === 'waiting') {
        refs.bannerTitle.textContent = '等待监听生效';
        refs.bannerText.textContent = '已获得权限，但系统尚未允许事件监听。重启应用后通常会生效。';
        refs.bannerPrimary.textContent = '重启应用';
        refs.bannerSecondary.hidden = false;
        refs.bannerSecondary.textContent = '打开系统设置';
      } else {
        refs.bannerTitle.textContent = '需要“输入监控”权限';
        refs.bannerText.textContent = 'macOS 只允许经你授权的应用读取全局按键与鼠标事件。授权后会自动开始记录。';
        refs.bannerPrimary.textContent = '授予权限';
        refs.bannerSecondary.hidden = false;
        refs.bannerSecondary.textContent = '打开系统设置';
      }
    }

    const footer = {
      connecting: '等待连接',
      monitoring: '实时更新中',
      paused: '已暂停记录',
      noPermission: '未开始记录',
      waiting: '等待权限生效',
    };
    refs.footerState.textContent = footer[state.status] || '实时更新中';
  }

  function ingest(payload) {
    if (!payload || typeof payload !== 'object') return;
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
