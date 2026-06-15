"use client";
import {
  require_react_dom
} from "./chunk-2TQQL6L7.js";
import {
  require_react
} from "./chunk-2PIBWAMS.js";
import {
  __toESM
} from "./chunk-V4OQ3NZ2.js";

// node_modules/sonner/dist/index.mjs
var import_react = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_react3 = __toESM(require_react(), 1);
function dt(c, { insertAt: a } = {}) {
  if (!c || typeof document == "undefined") return;
  let t = document.head || document.getElementsByTagName("head")[0], s = document.createElement("style");
  s.type = "text/css", a === "top" && t.firstChild ? t.insertBefore(s, t.firstChild) : t.appendChild(s), s.styleSheet ? s.styleSheet.cssText = c : s.appendChild(document.createTextNode(c));
}
dt(`html[dir=ltr],[data-sonner-toaster][dir=ltr]{--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}html[dir=rtl],[data-sonner-toaster][dir=rtl]{--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999}[data-sonner-toaster][data-x-position=right]{right:max(var(--offset),env(safe-area-inset-right))}[data-sonner-toaster][data-x-position=left]{left:max(var(--offset),env(safe-area-inset-left))}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translate(-50%)}[data-sonner-toaster][data-y-position=top]{top:max(var(--offset),env(safe-area-inset-top))}[data-sonner-toaster][data-y-position=bottom]{bottom:max(var(--offset),env(safe-area-inset-bottom))}[data-sonner-toast]{--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}[data-sonner-toast][data-y-position=top]{top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}[data-sonner-toast] [data-description]{font-weight:400;line-height:1.4;color:inherit}[data-sonner-toast] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast] [data-icon]>*{flex-shrink:0}[data-sonner-toast] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast] [data-button]:focus-visible{box-shadow:0 0 0 2px #0006}[data-sonner-toast] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toast][data-theme=dark] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;background:var(--gray1);color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]:focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}[data-sonner-toast] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]:before{content:"";position:absolute;left:0;right:0;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]:before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]:before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]:before{content:"";position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast]:after{content:"";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y: translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y: translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]:before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount, 0px));transition:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation:swipe-out .2s ease-out forwards}@keyframes swipe-out{0%{transform:translateY(calc(var(--lift) * var(--offset) + var(--swipe-amount)));opacity:1}to{transform:translateY(calc(var(--lift) * var(--offset) + var(--swipe-amount) + var(--lift) * -100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;--mobile-offset: 16px;right:var(--mobile-offset);left:var(--mobile-offset);width:100%}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - 32px)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset)}[data-sonner-toaster][data-y-position=bottom]{bottom:20px}[data-sonner-toaster][data-y-position=top]{top:20px}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset);right:var(--mobile-offset);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-rich-colors=true] [data-sonner-toast][data-type=success],[data-rich-colors=true] [data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true] [data-sonner-toast][data-type=info],[data-rich-colors=true] [data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true] [data-sonner-toast][data-type=warning],[data-rich-colors=true] [data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true] [data-sonner-toast][data-type=error],[data-rich-colors=true] [data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
`);
var kt = (c) => {
  switch (c) {
    case "success":
      return At;
    case "info":
      return jt;
    case "warning":
      return Yt;
    case "error":
      return Ft;
    default:
      return null;
  }
};
var zt = Array(12).fill(0);
var It = ({ visible: c }) => import_react2.default.createElement("div", { className: "sonner-loading-wrapper", "data-visible": c }, import_react2.default.createElement("div", { className: "sonner-spinner" }, zt.map((a, t) => import_react2.default.createElement("div", { className: "sonner-loading-bar", key: `spinner-bar-${t}` }))));
var At = import_react2.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, import_react2.default.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" }));
var Yt = import_react2.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", height: "20", width: "20" }, import_react2.default.createElement("path", { fillRule: "evenodd", d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z", clipRule: "evenodd" }));
var jt = import_react2.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, import_react2.default.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z", clipRule: "evenodd" }));
var Ft = import_react2.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, import_react2.default.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z", clipRule: "evenodd" }));
var Mt = () => {
  let [c, a] = import_react3.default.useState(false);
  return import_react3.default.useEffect(() => {
    let t = () => {
      a(document.hidden);
    };
    return document.addEventListener("visibilitychange", t), () => window.removeEventListener("visibilitychange", t);
  }, []), c;
};
var ct = 1;
var ut = class {
  constructor() {
    this.subscribe = (a) => (this.subscribers.push(a), () => {
      let t = this.subscribers.indexOf(a);
      this.subscribers.splice(t, 1);
    });
    this.publish = (a) => {
      this.subscribers.forEach((t) => t(a));
    };
    this.addToast = (a) => {
      this.publish(a), this.toasts = [...this.toasts, a];
    };
    this.create = (a) => {
      var m;
      let { message: t, ...s } = a, v = typeof (a == null ? void 0 : a.id) == "number" || ((m = a.id) == null ? void 0 : m.length) > 0 ? a.id : ct++, g = this.toasts.find((r) => r.id === v), f = a.dismissible === void 0 ? true : a.dismissible;
      return g ? this.toasts = this.toasts.map((r) => r.id === v ? (this.publish({ ...r, ...a, id: v, title: t }), { ...r, ...a, id: v, dismissible: f, title: t }) : r) : this.addToast({ title: t, ...s, dismissible: f, id: v }), v;
    };
    this.dismiss = (a) => (a || this.toasts.forEach((t) => {
      this.subscribers.forEach((s) => s({ id: t.id, dismiss: true }));
    }), this.subscribers.forEach((t) => t({ id: a, dismiss: true })), a);
    this.message = (a, t) => this.create({ ...t, message: a });
    this.error = (a, t) => this.create({ ...t, message: a, type: "error" });
    this.success = (a, t) => this.create({ ...t, type: "success", message: a });
    this.info = (a, t) => this.create({ ...t, type: "info", message: a });
    this.warning = (a, t) => this.create({ ...t, type: "warning", message: a });
    this.loading = (a, t) => this.create({ ...t, type: "loading", message: a });
    this.promise = (a, t) => {
      if (!t) return;
      let s;
      t.loading !== void 0 && (s = this.create({ ...t, promise: a, type: "loading", message: t.loading, description: typeof t.description != "function" ? t.description : void 0 }));
      let v = a instanceof Promise ? a : a(), g = s !== void 0;
      return v.then((f) => {
        if (f && typeof f.ok == "boolean" && !f.ok) {
          g = false;
          let m = typeof t.error == "function" ? t.error(`HTTP error! status: ${f.status}`) : t.error, r = typeof t.description == "function" ? t.description(`HTTP error! status: ${f.status}`) : t.description;
          this.create({ id: s, type: "error", message: m, description: r });
        } else if (t.success !== void 0) {
          g = false;
          let m = typeof t.success == "function" ? t.success(f) : t.success, r = typeof t.description == "function" ? t.description(f) : t.description;
          this.create({ id: s, type: "success", message: m, description: r });
        }
      }).catch((f) => {
        if (t.error !== void 0) {
          g = false;
          let m = typeof t.error == "function" ? t.error(f) : t.error, r = typeof t.description == "function" ? t.description(f) : t.description;
          this.create({ id: s, type: "error", message: m, description: r });
        }
      }).finally(() => {
        var f;
        g && (this.dismiss(s), s = void 0), (f = t.finally) == null || f.call(t);
      }), s;
    };
    this.custom = (a, t) => {
      let s = (t == null ? void 0 : t.id) || ct++;
      return this.create({ jsx: a(s), id: s, ...t }), s;
    };
    this.subscribers = [], this.toasts = [];
  }
};
var E = new ut();
var $t = (c, a) => {
  let t = (a == null ? void 0 : a.id) || ct++;
  return E.addToast({ title: c, ...a, id: t }), t;
};
var _t = $t;
var Ut = Object.assign(_t, { success: E.success, info: E.info, warning: E.warning, error: E.error, custom: E.custom, message: E.message, promise: E.promise, dismiss: E.dismiss, loading: E.loading });
var Vt = 3;
var Kt = "32px";
var Xt = 4e3;
var Jt = 356;
var Dt = 14;
var Gt = 20;
var qt = 200;
function Ot(...c) {
  return c.filter(Boolean).join(" ");
}
var Qt = (c) => {
  var bt, yt, vt, xt, Tt, wt, Et;
  let { invert: a, toast: t, unstyled: s, interacting: v, setHeights: g, visibleToasts: f, heights: m, index: r, toasts: Q, expanded: F, removeToast: U, closeButton: W, style: n, cancelButtonStyle: V, actionButtonStyle: Z, className: tt = "", descriptionClassName: et = "", duration: K, position: at, gap: ot = Dt, loadingIcon: I, expandByDefault: R, classNames: i, icons: x, closeButtonAriaLabel: st = "Close toast", pauseWhenPageIsHidden: X, cn: T } = c, [L, J] = import_react.default.useState(false), [G, z] = import_react.default.useState(false), [C, q] = import_react.default.useState(false), [B, A] = import_react.default.useState(false), [nt, l] = import_react.default.useState(0), [p, h] = import_react.default.useState(0), D = import_react.default.useRef(null), w = import_react.default.useRef(null), u = r === 0, $ = r + 1 <= f, b = t.type, P = t.dismissible !== false, _ = t.className || "", Pt = t.descriptionClassName || "", O = import_react.default.useMemo(() => m.findIndex((o) => o.toastId === t.id) || 0, [m, t.id]), Ct = import_react.default.useMemo(() => {
    var o;
    return (o = t.closeButton) != null ? o : W;
  }, [t.closeButton, W]), ft = import_react.default.useMemo(() => t.duration || K || Xt, [t.duration, K]), rt = import_react.default.useRef(0), Y = import_react.default.useRef(0), mt = import_react.default.useRef(0), j = import_react.default.useRef(null), [pt, Ht] = at.split("-"), gt = import_react.default.useMemo(() => m.reduce((o, d, y) => y >= O ? o : o + d.height, 0), [m, O]), ht = Mt(), Rt = t.invert || a, it = b === "loading";
  Y.current = import_react.default.useMemo(() => O * ot + gt, [O, gt]), import_react.default.useEffect(() => {
    J(true);
  }, []), import_react.default.useLayoutEffect(() => {
    if (!L) return;
    let o = w.current, d = o.style.height;
    o.style.height = "auto";
    let y = o.getBoundingClientRect().height;
    o.style.height = d, h(y), g((M) => M.find((S) => S.toastId === t.id) ? M.map((S) => S.toastId === t.id ? { ...S, height: y } : S) : [{ toastId: t.id, height: y, position: t.position }, ...M]);
  }, [L, t.title, t.description, g, t.id]);
  let H = import_react.default.useCallback(() => {
    z(true), l(Y.current), g((o) => o.filter((d) => d.toastId !== t.id)), setTimeout(() => {
      U(t);
    }, qt);
  }, [t, U, g, Y]);
  import_react.default.useEffect(() => {
    if (t.promise && b === "loading" || t.duration === 1 / 0 || t.type === "loading") return;
    let o, d = ft;
    return F || v || X && ht ? (() => {
      if (mt.current < rt.current) {
        let N = (/* @__PURE__ */ new Date()).getTime() - rt.current;
        d = d - N;
      }
      mt.current = (/* @__PURE__ */ new Date()).getTime();
    })() : (() => {
      rt.current = (/* @__PURE__ */ new Date()).getTime(), o = setTimeout(() => {
        var N;
        (N = t.onAutoClose) == null || N.call(t, t), H();
      }, d);
    })(), () => clearTimeout(o);
  }, [F, v, R, t, ft, H, t.promise, b, X, ht]), import_react.default.useEffect(() => {
    let o = w.current;
    if (o) {
      let d = o.getBoundingClientRect().height;
      return h(d), g((y) => [{ toastId: t.id, height: d, position: t.position }, ...y]), () => g((y) => y.filter((M) => M.toastId !== t.id));
    }
  }, [g, t.id]), import_react.default.useEffect(() => {
    t.delete && H();
  }, [H, t.delete]);
  function Lt() {
    return x != null && x.loading ? import_react.default.createElement("div", { className: "loader", "data-visible": b === "loading" }, x.loading) : I ? import_react.default.createElement("div", { className: "sonner-loader", "data-visible": b === "loading" }, I) : import_react.default.createElement(It, { visible: b === "loading" });
  }
  return import_react.default.createElement("li", { "aria-live": t.important ? "assertive" : "polite", "aria-atomic": "true", role: "status", tabIndex: 0, ref: w, className: T(tt, _, i == null ? void 0 : i.toast, (bt = t == null ? void 0 : t.classNames) == null ? void 0 : bt.toast, i == null ? void 0 : i.default, i == null ? void 0 : i[b], (yt = t == null ? void 0 : t.classNames) == null ? void 0 : yt[b]), "data-sonner-toast": "", "data-styled": !(t.jsx || t.unstyled || s), "data-mounted": L, "data-promise": !!t.promise, "data-removed": G, "data-visible": $, "data-y-position": pt, "data-x-position": Ht, "data-index": r, "data-front": u, "data-swiping": C, "data-dismissible": P, "data-type": b, "data-invert": Rt, "data-swipe-out": B, "data-expanded": !!(F || R && L), style: { "--index": r, "--toasts-before": r, "--z-index": Q.length - r, "--offset": `${G ? nt : Y.current}px`, "--initial-height": R ? "auto" : `${p}px`, ...n, ...t.style }, onPointerDown: (o) => {
    it || !P || (D.current = /* @__PURE__ */ new Date(), l(Y.current), o.target.setPointerCapture(o.pointerId), o.target.tagName !== "BUTTON" && (q(true), j.current = { x: o.clientX, y: o.clientY }));
  }, onPointerUp: () => {
    var M, N, S, lt;
    if (B || !P) return;
    j.current = null;
    let o = Number(((M = w.current) == null ? void 0 : M.style.getPropertyValue("--swipe-amount").replace("px", "")) || 0), d = (/* @__PURE__ */ new Date()).getTime() - ((N = D.current) == null ? void 0 : N.getTime()), y = Math.abs(o) / d;
    if (Math.abs(o) >= Gt || y > 0.11) {
      l(Y.current), (S = t.onDismiss) == null || S.call(t, t), H(), A(true);
      return;
    }
    (lt = w.current) == null || lt.style.setProperty("--swipe-amount", "0px"), q(false);
  }, onPointerMove: (o) => {
    var St;
    if (!j.current || !P) return;
    let d = o.clientY - j.current.y, y = o.clientX - j.current.x, N = (pt === "top" ? Math.min : Math.max)(0, d), S = o.pointerType === "touch" ? 10 : 2;
    Math.abs(N) > S ? (St = w.current) == null || St.style.setProperty("--swipe-amount", `${d}px`) : Math.abs(y) > S && (j.current = null);
  } }, Ct && !t.jsx ? import_react.default.createElement("button", { "aria-label": st, "data-disabled": it, "data-close-button": true, onClick: it || !P ? () => {
  } : () => {
    var o;
    H(), (o = t.onDismiss) == null || o.call(t, t);
  }, className: T(i == null ? void 0 : i.closeButton, (vt = t == null ? void 0 : t.classNames) == null ? void 0 : vt.closeButton) }, import_react.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, import_react.default.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), import_react.default.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))) : null, t.jsx || import_react.default.isValidElement(t.title) ? t.jsx || t.title : import_react.default.createElement(import_react.default.Fragment, null, b || t.icon || t.promise ? import_react.default.createElement("div", { "data-icon": "" }, t.promise || t.type === "loading" && !t.icon ? t.icon || (x == null ? void 0 : x.loading) || Lt() : null, t.type !== "loading" ? t.icon || (x == null ? void 0 : x[b]) || kt(b) : null) : null, import_react.default.createElement("div", { "data-content": "" }, import_react.default.createElement("div", { "data-title": "", className: T(i == null ? void 0 : i.title, (xt = t == null ? void 0 : t.classNames) == null ? void 0 : xt.title) }, t.title), t.description ? import_react.default.createElement("div", { "data-description": "", className: T(et, Pt, i == null ? void 0 : i.description, (Tt = t == null ? void 0 : t.classNames) == null ? void 0 : Tt.description) }, t.description) : null), t.cancel ? import_react.default.createElement("button", { "data-button": true, "data-cancel": true, style: t.cancelButtonStyle || V, onClick: (o) => {
    var d;
    P && (H(), (d = t.cancel) != null && d.onClick && t.cancel.onClick(o));
  }, className: T(i == null ? void 0 : i.cancelButton, (wt = t == null ? void 0 : t.classNames) == null ? void 0 : wt.cancelButton) }, t.cancel.label) : null, t.action ? import_react.default.createElement("button", { "data-button": "", style: t.actionButtonStyle || Z, onClick: (o) => {
    var d;
    (d = t.action) == null || d.onClick(o), !o.defaultPrevented && H();
  }, className: T(i == null ? void 0 : i.actionButton, (Et = t == null ? void 0 : t.classNames) == null ? void 0 : Et.actionButton) }, t.action.label) : null));
};
function Nt() {
  if (typeof window == "undefined" || typeof document == "undefined") return "ltr";
  let c = document.documentElement.getAttribute("dir");
  return c === "auto" || !c ? window.getComputedStyle(document.documentElement).direction : c;
}
var fe = (c) => {
  let { invert: a, position: t = "bottom-right", hotkey: s = ["altKey", "KeyT"], expand: v, closeButton: g, className: f, offset: m, theme: r = "light", richColors: Q, duration: F, style: U, visibleToasts: W = Vt, toastOptions: n, dir: V = Nt(), gap: Z, loadingIcon: tt, icons: et, containerAriaLabel: K = "Notifications", pauseWhenPageIsHidden: at, cn: ot = Ot } = c, [I, R] = import_react.default.useState([]), i = import_react.default.useMemo(() => Array.from(new Set([t].concat(I.filter((l) => l.position).map((l) => l.position)))), [I, t]), [x, st] = import_react.default.useState([]), [X, T] = import_react.default.useState(false), [L, J] = import_react.default.useState(false), [G, z] = import_react.default.useState(r !== "system" ? r : typeof window != "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), C = import_react.default.useRef(null), q = s.join("+").replace(/Key/g, "").replace(/Digit/g, ""), B = import_react.default.useRef(null), A = import_react.default.useRef(false), nt = import_react.default.useCallback((l) => R((p) => p.filter(({ id: h }) => h !== l.id)), []);
  return import_react.default.useEffect(() => E.subscribe((l) => {
    if (l.dismiss) {
      R((p) => p.map((h) => h.id === l.id ? { ...h, delete: true } : h));
      return;
    }
    setTimeout(() => {
      import_react_dom.default.flushSync(() => {
        R((p) => {
          let h = p.findIndex((D) => D.id === l.id);
          return h !== -1 ? [...p.slice(0, h), { ...p[h], ...l }, ...p.slice(h + 1)] : [l, ...p];
        });
      });
    });
  }), []), import_react.default.useEffect(() => {
    if (r !== "system") {
      z(r);
      return;
    }
    r === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? z("dark") : z("light")), typeof window != "undefined" && window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches: l }) => {
      z(l ? "dark" : "light");
    });
  }, [r]), import_react.default.useEffect(() => {
    I.length <= 1 && T(false);
  }, [I]), import_react.default.useEffect(() => {
    let l = (p) => {
      var D, w;
      s.every((u) => p[u] || p.code === u) && (T(true), (D = C.current) == null || D.focus()), p.code === "Escape" && (document.activeElement === C.current || (w = C.current) != null && w.contains(document.activeElement)) && T(false);
    };
    return document.addEventListener("keydown", l), () => document.removeEventListener("keydown", l);
  }, [s]), import_react.default.useEffect(() => {
    if (C.current) return () => {
      B.current && (B.current.focus({ preventScroll: true }), B.current = null, A.current = false);
    };
  }, [C.current]), I.length ? import_react.default.createElement("section", { "aria-label": `${K} ${q}`, tabIndex: -1 }, i.map((l, p) => {
    var w;
    let [h, D] = l.split("-");
    return import_react.default.createElement("ol", { key: l, dir: V === "auto" ? Nt() : V, tabIndex: -1, ref: C, className: f, "data-sonner-toaster": true, "data-theme": G, "data-rich-colors": Q, "data-y-position": h, "data-x-position": D, style: { "--front-toast-height": `${((w = x[0]) == null ? void 0 : w.height) || 0}px`, "--offset": typeof m == "number" ? `${m}px` : m || Kt, "--width": `${Jt}px`, "--gap": `${Dt}px`, ...U }, onBlur: (u) => {
      A.current && !u.currentTarget.contains(u.relatedTarget) && (A.current = false, B.current && (B.current.focus({ preventScroll: true }), B.current = null));
    }, onFocus: (u) => {
      u.target instanceof HTMLElement && u.target.dataset.dismissible === "false" || A.current || (A.current = true, B.current = u.relatedTarget);
    }, onMouseEnter: () => T(true), onMouseMove: () => T(true), onMouseLeave: () => {
      L || T(false);
    }, onPointerDown: (u) => {
      u.target instanceof HTMLElement && u.target.dataset.dismissible === "false" || J(true);
    }, onPointerUp: () => J(false) }, I.filter((u) => !u.position && p === 0 || u.position === l).map((u, $) => {
      var b, P;
      return import_react.default.createElement(Qt, { key: u.id, icons: et, index: $, toast: u, duration: (b = n == null ? void 0 : n.duration) != null ? b : F, className: n == null ? void 0 : n.className, descriptionClassName: n == null ? void 0 : n.descriptionClassName, invert: a, visibleToasts: W, closeButton: (P = n == null ? void 0 : n.closeButton) != null ? P : g, interacting: L, position: l, style: n == null ? void 0 : n.style, unstyled: n == null ? void 0 : n.unstyled, classNames: n == null ? void 0 : n.classNames, cancelButtonStyle: n == null ? void 0 : n.cancelButtonStyle, actionButtonStyle: n == null ? void 0 : n.actionButtonStyle, removeToast: nt, toasts: I.filter((_) => _.position == u.position), heights: x.filter((_) => _.position == u.position), setHeights: st, expandByDefault: v, gap: Z, loadingIcon: tt, expanded: X, pauseWhenPageIsHidden: at, cn: ot });
    }));
  })) : null;
};
export {
  fe as Toaster,
  Ut as toast
};
//# sourceMappingURL=sonner.js.map
