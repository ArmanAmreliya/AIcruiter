"use client";
import {
  require_react
} from "./chunk-2PIBWAMS.js";
import {
  __toESM
} from "./chunk-V4OQ3NZ2.js";

// node_modules/react-error-boundary/dist/react-error-boundary.js
var import_react = __toESM(require_react());
var h = (0, import_react.createContext)(null);
var c = {
  didCatch: false,
  error: null
};
var m = class extends import_react.Component {
  constructor(t) {
    super(t), this.resetErrorBoundary = this.resetErrorBoundary.bind(this), this.state = c;
  }
  static getDerivedStateFromError(t) {
    return { didCatch: true, error: t };
  }
  resetErrorBoundary(...t) {
    var _a, _b;
    const { error: e } = this.state;
    e !== null && ((_b = (_a = this.props).onReset) == null ? void 0 : _b.call(_a, {
      args: t,
      reason: "imperative-api"
    }), this.setState(c));
  }
  componentDidCatch(t, e) {
    var _a, _b;
    (_b = (_a = this.props).onError) == null ? void 0 : _b.call(_a, t, e);
  }
  componentDidUpdate(t, e) {
    var _a, _b;
    const { didCatch: o } = this.state, { resetKeys: n } = this.props;
    o && e.error !== null && C(t.resetKeys, n) && ((_b = (_a = this.props).onReset) == null ? void 0 : _b.call(_a, {
      next: n,
      prev: t.resetKeys,
      reason: "keys"
    }), this.setState(c));
  }
  render() {
    const { children: t, fallbackRender: e, FallbackComponent: o, fallback: n } = this.props, { didCatch: s, error: a } = this.state;
    let i = t;
    if (s) {
      const u = {
        error: a,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof e == "function")
        i = e(u);
      else if (o)
        i = (0, import_react.createElement)(o, u);
      else if (n !== void 0)
        i = n;
      else
        throw a;
    }
    return (0, import_react.createElement)(
      h.Provider,
      {
        value: {
          didCatch: s,
          error: a,
          resetErrorBoundary: this.resetErrorBoundary
        }
      },
      i
    );
  }
};
function C(r = [], t = []) {
  return r.length !== t.length || r.some((e, o) => !Object.is(e, t[o]));
}
function x(r) {
  return r !== null && typeof r == "object" && "didCatch" in r && typeof r.didCatch == "boolean" && "error" in r && "resetErrorBoundary" in r && typeof r.resetErrorBoundary == "function";
}
function w(r) {
  if (!x(r))
    throw new Error("ErrorBoundaryContext not found");
}
function S() {
  const r = (0, import_react.useContext)(h);
  w(r);
  const { error: t, resetErrorBoundary: e } = r, [o, n] = (0, import_react.useState)({
    error: null,
    hasError: false
  }), s = (0, import_react.useMemo)(
    () => ({
      error: t,
      resetBoundary: () => {
        e(), n({ error: null, hasError: false });
      },
      showBoundary: (a) => n({
        error: a,
        hasError: true
      })
    }),
    [t, e]
  );
  if (o.hasError)
    throw o.error;
  return s;
}
function k(r, t) {
  const e = (0, import_react.forwardRef)(
    (n, s) => (0, import_react.createElement)(
      m,
      t,
      (0, import_react.createElement)(r, { ...n, ref: s })
    )
  ), o = r.displayName || r.name || "Unknown";
  return e.displayName = `withErrorBoundary(${o})`, e;
}
export {
  m as ErrorBoundary,
  h as ErrorBoundaryContext,
  S as useErrorBoundary,
  k as withErrorBoundary
};
//# sourceMappingURL=react-error-boundary.js.map
