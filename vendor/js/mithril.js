// Modified by Fabio Cevasco to support ES6 module loading.
//#FC
//;(function() {
//"use strict"
function Vnode(tag, key, attrs0, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false};
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) { return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined); }
	if (node != null && typeof node !== "object") { return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined); }
	return node;
};
Vnode.normalizeChildren = function normalizeChildren(children) {
	for (let i = 0; i < children.length; i++) {
		children[i] = Vnode.normalize(children[i]);
	}
	return children;
};
const selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
const selectorCache = {};
const hasOwn = {}.hasOwnProperty;
function compileSelector(selector) {
	let match, 
tag = "div", 
classes = [], 
attrs = {};
	while (match = selectorParser.exec(selector)) {
		let type = match[1], 
value = match[2];
		if (type === "" && value !== "") { tag = value; }
		else if (type === "#") { attrs.id = value; }
		else if (type === ".") { classes.push(value); }
		else if (match[3][0] === "[") {
			let attrValue = match[6];
			if (attrValue) { attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\"); }
			if (match[4] === "class") { classes.push(attrValue); }
			else { attrs[match[4]] = attrValue || true; }
		}
	}
	if (classes.length > 0) { attrs.className = classes.join(" "); }
	return selectorCache[selector] = {tag: tag, attrs: attrs};
}
function execSelector(state, attrs, children) {
	let hasAttrs = false, 
childList, text;
	const className = attrs.className || attrs.class;
	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key)) {
			attrs[key] = state.attrs[key];
		}
	}
	if (className !== undefined) {
		if (attrs.class !== undefined) {
			attrs.class = undefined;
			attrs.className = className;
		}
		if (state.attrs.className != null) {
			attrs.className = `${state.attrs.className} ${className}`;
		}
	}
	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			hasAttrs = true;
			break;
		}
	}
	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		text = children[0].children;
	} else {
		childList = children;
	}
	return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text);
}
function hyperscript(selector) {
	// Because sloppy mode sucks
	let attrs = arguments[1], 
start = 2, 
children;
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	if (typeof selector === "string") {
		var cached = selectorCache[selector] || compileSelector(selector);
	}
	if (attrs == null) {
		attrs = {};
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {};
		start = 1;
	}
	if (arguments.length === start + 1) {
		children = arguments[start];
		if (!Array.isArray(children)) { children = [children]; }
	} else {
		children = [];
		while (start < arguments.length) { children.push(arguments[start++]); }
	}
	const normalized = Vnode.normalizeChildren(children);
	if (typeof selector === "string") {
		return execSelector(cached, attrs, normalized);
	} 
		return Vnode(selector, attrs.key, attrs, normalized);
	
}
hyperscript.trust = function(html) {
	if (html == null) { html = ""; }
	return Vnode("<", undefined, undefined, html, undefined, undefined);
};
hyperscript.fragment = function(attrs1, children) {
	return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined);
};
const m = hyperscript;

/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) { throw new Error("Promise must be called with `new`"); }
	if (typeof executor !== "function") { throw new TypeError("executor must be a function"); }
	let self = this, 
resolvers = [], 
rejectors = [], 
resolveCurrent = handler(resolvers, true), 
rejectCurrent = handler(rejectors, false);
	const instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
	const callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			let then;
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) { throw new TypeError("Promise can't be resolved w/ itself"); }
					executeOnce(then.bind(value));
				}
				else {
					callAsync(() => {
						if (!shouldAbsorb && list.length === 0) { console.error("Possible unhandled promise rejection:", value); }
						for (let i = 0; i < list.length; i++) { list[i](value); }
						resolvers.length = 0, rejectors.length = 0;
						instance.state = shouldAbsorb;
						instance.retry = function() { execute(value); };
					});
				}
			}
			catch (e) {
				rejectCurrent(e);
			}
		};
	}
	function executeOnce(then) {
		let runs = 0;
		function run(fn) {
			return function(value) {
				if (runs++ > 0) { return; }
				fn(value);
			};
		}
		const onerror = run(rejectCurrent);
		try { then(run(resolveCurrent), onerror); } catch (e) { onerror(e); }
	}
	executeOnce(executor);
};
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	let self = this, 
instance = self._instance;
	function handle(callback, list, next, state) {
		list.push((value) => {
			if (typeof callback !== "function") { next(value); }
			else { try { resolveNext(callback(value)); } catch (e) { if (rejectNext) { rejectNext(e); } } }
		});
		if (typeof instance.retry === "function" && state === instance.state) { instance.retry(); }
	}
	let resolveNext, rejectNext;
	const promise = new PromisePolyfill((resolve, reject) => { resolveNext = resolve, rejectNext = reject; });
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
	return promise;
};
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection);
};
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) { return value; }
	return new PromisePolyfill((resolve) => { resolve(value); });
};
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill((resolve, reject) => { reject(value); });
};
PromisePolyfill.all = function(list) {
	return new PromisePolyfill((resolve, reject) => {
		let total = list.length, 
count = 0, 
values = [];
		if (list.length === 0) { resolve([]); }
		else { for (let i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++;
					values[i] = value;
					if (count === total) { resolve(values); }
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject);
				}
				else { consume(list[i]); }
			}(i));
		} }
	});
};
PromisePolyfill.race = function(list) {
	return new PromisePolyfill((resolve, reject) => {
		for (let i = 0; i < list.length; i++) {
			list[i].then(resolve, reject);
		}
	});
};
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") { window.Promise = PromisePolyfill; }
	var PromisePolyfill = window.Promise;
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") { global.Promise = PromisePolyfill; }
	var PromisePolyfill = global.Promise;
} else {
}
const buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") { return ""; }
	const args = [];
	for (const key0 in object) {
		destructure(key0, object[key0]);
	}
	return args.join("&");
	function destructure(key0, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(`${key0}[${i}]`, value[i]);
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(`${key0}[${i}]`, value[i]);
			}
		}
		else { args.push(encodeURIComponent(key0) + (value != null && value !== "" ? `=${encodeURIComponent(value)}` : "")); }
	}
};
const FILE_PROTOCOL_REGEX = new RegExp("^file://", "i");
const _8 = function($window, Promise) {
	let callbackCount = 0;
	let oncompletion;
	function setCompletionCallback(callback) { oncompletion = callback; }
	function finalizer() {
		let count = 0;
		function complete() { if (--count === 0 && typeof oncompletion === "function") { oncompletion(); } }
		return function finalize(promise0) {
			const then0 = promise0.then;
			promise0.then = function() {
				count++;
				const next = then0.apply(promise0, arguments);
				next.then(complete, (e) => {
					complete();
					if (count === 0) { throw e; }
				});
				return finalize(next);
			};
			return promise0;
		};
	}
	function normalize(args, extra) {
		if (typeof args === "string") {
			const url = args;
			args = extra || {};
			if (args.url == null) { args.url = url; }
		}
		return args;
	}
	function request(args, extra) {
		const finalize = finalizer();
		args = normalize(args, extra);
		const promise0 = new Promise((resolve, reject) => {
			if (args.method == null) { args.method = "GET"; }
			args.method = args.method.toUpperCase();
			const useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true);
			if (typeof args.serialize !== "function") { args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) { return value; } : JSON.stringify; }
			if (typeof args.deserialize !== "function") { args.deserialize = deserialize; }
			if (typeof args.extract !== "function") { args.extract = extract; }
			args.url = interpolate(args.url, args.data);
			if (useBody) { args.data = args.serialize(args.data); }
			else { args.url = assemble(args.url, args.data); }
			let xhr = new $window.XMLHttpRequest(),
				aborted = false,
				_abort = xhr.abort;
			xhr.abort = function abort() {
				aborted = true;
				_abort.call(xhr);
			};
			xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);
			if (args.serialize === JSON.stringify && useBody) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			}
			if (args.deserialize === deserialize) {
				xhr.setRequestHeader("Accept", "application/json, text/*");
			}
			if (args.withCredentials) { xhr.withCredentials = args.withCredentials; }
			for (const key in args.headers) { if ({}.hasOwnProperty.call(args.headers, key)) {
				xhr.setRequestHeader(key, args.headers[key]);
			} }
			if (typeof args.config === "function") { xhr = args.config(xhr, args) || xhr; }
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if(aborted) { return; }
				if (xhr.readyState === 4) {
					try {
						const response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args));
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
							resolve(cast(args.type, response));
						}
						else {
							const error = new Error(xhr.responseText);
							for (const key in response) { error[key] = response[key]; }
							reject(error);
						}
					}
					catch (e) {
						reject(e);
					}
				}
			};
			if (useBody && (args.data != null)) { xhr.send(args.data); }
			else { xhr.send(); }
		});
		return args.background === true ? promise0 : finalize(promise0);
	}
	function jsonp(args, extra) {
		const finalize = finalizer();
		args = normalize(args, extra);
		const promise0 = new Promise((resolve, reject) => {
			const callbackName = args.callbackName || `_mithril_${Math.round(Math.random() * 1e16)}_${callbackCount++}`;
			const script = $window.document.createElement("script");
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script);
				resolve(cast(args.type, data));
				delete $window[callbackName];
			};
			script.onerror = function() {
				script.parentNode.removeChild(script);
				reject(new Error("JSONP request failed"));
				delete $window[callbackName];
			};
			if (args.data == null) { args.data = {}; }
			args.url = interpolate(args.url, args.data);
			args.data[args.callbackKey || "callback"] = callbackName;
			script.src = assemble(args.url, args.data);
			$window.document.documentElement.appendChild(script);
		});
		return args.background === true? promise0 : finalize(promise0);
	}
	function interpolate(url, data) {
		if (data == null) { return url; }
		const tokens = url.match(/:[^\/]+/gi) || [];
		for (let i = 0; i < tokens.length; i++) {
			const key = tokens[i].slice(1);
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key]);
			}
		}
		return url;
	}
	function assemble(url, data) {
		const querystring = buildQueryString(data);
		if (querystring !== "") {
			const prefix = url.indexOf("?") < 0 ? "?" : "&";
			url += prefix + querystring;
		}
		return url;
	}
	function deserialize(data) {
		try { return data !== "" ? JSON.parse(data) : null; }
		catch (e) { throw new Error(data); }
	}
	function extract(xhr) { return xhr.responseText; }
	function cast(type0, data) {
		if (typeof type0 === "function") {
			if (Array.isArray(data)) {
				for (let i = 0; i < data.length; i++) {
					data[i] = new type0(data[i]);
				}
			}
			else { return new type0(data); }
		}
		return data;
	}
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback};
};
const requestService = _8(window, PromisePolyfill);
const coreRenderer = function($window) {
	const $doc = $window.document;
	const $emptyFragment = $doc.createDocumentFragment();
	let onevent;
	function setEventCallback(callback) { return onevent = callback; }
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (let i = start; i < end; i++) {
			const vnode = vnodes[i];
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling);
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		const tag = vnode.tag;
		if (typeof tag === "string") {
			vnode.state = {};
			if (vnode.attrs != null) { initLifecycle(vnode.attrs, vnode, hooks); }
			switch (tag) {
				case "#": return createText(parent, vnode, nextSibling);
				case "<": return createHTML(parent, vnode, nextSibling);
				case "[": return createFragment(parent, vnode, hooks, ns, nextSibling);
				default: return createElement(parent, vnode, hooks, ns, nextSibling);
			}
		}
		else { return createComponent(parent, vnode, hooks, ns, nextSibling); }
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children);
		insertNode(parent, vnode.dom, nextSibling);
		return vnode.dom;
	}
	function createHTML(parent, vnode, nextSibling) {
		const match1 = vnode.children.match(/^\s*?<(\w+)/im) || [];
		const parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div";
		const temp = $doc.createElement(parent1);
		temp.innerHTML = vnode.children;
		vnode.dom = temp.firstChild;
		vnode.domSize = temp.childNodes.length;
		const fragment = $doc.createDocumentFragment();
		let child;
		while (child = temp.firstChild) {
			fragment.appendChild(child);
		}
		insertNode(parent, fragment, nextSibling);
		return fragment;
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		const fragment = $doc.createDocumentFragment();
		if (vnode.children != null) {
			const children = vnode.children;
			createNodes(fragment, children, 0, children.length, hooks, null, ns);
		}
		vnode.dom = fragment.firstChild;
		vnode.domSize = fragment.childNodes.length;
		insertNode(parent, fragment, nextSibling);
		return fragment;
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		const tag = vnode.tag;
		switch (vnode.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break;
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break;
		}
		const attrs2 = vnode.attrs;
		const is = attrs2 && attrs2.is;
		const element = ns
			? is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag)
			: is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
		vnode.dom = element;
		if (attrs2 != null) {
			setAttrs(vnode, attrs2, ns);
		}
		insertNode(parent, element, nextSibling);
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode);
		}
		else {
			if (vnode.text != null) {
				if (vnode.text !== "") { element.textContent = vnode.text; }
				else { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
			}
			if (vnode.children != null) {
				const children = vnode.children;
				createNodes(element, children, 0, children.length, hooks, null, ns);
				setLateAttrs(vnode);
			}
		}
		return element;
	}
	function initComponent(vnode, hooks) {
		let sentinel;
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag);
			sentinel = vnode.state.view;
			if (sentinel.$$reentrantLock$$ != null) { return $emptyFragment; }
			sentinel.$$reentrantLock$$ = true;
		} else {
			vnode.state = void 0;
			sentinel = vnode.tag;
			if (sentinel.$$reentrantLock$$ != null) { return $emptyFragment; }
			sentinel.$$reentrantLock$$ = true;
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode);
		}
		vnode._state = vnode.state;
		if (vnode.attrs != null) { initLifecycle(vnode.attrs, vnode, hooks); }
		initLifecycle(vnode._state, vnode, hooks);
		vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode));
		if (vnode.instance === vnode) { throw Error("A view cannot return the vnode it received as argument"); }
		sentinel.$$reentrantLock$$ = null;
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks);
		if (vnode.instance != null) {
			const element = createNode(parent, vnode.instance, hooks, ns, nextSibling);
			vnode.dom = vnode.instance.dom;
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
			insertNode(parent, element, nextSibling);
			return element;
		}
		
			vnode.domSize = 0;
			return $emptyFragment;
		
	}
	//update
	function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) { return; }
		else if (old == null) { createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, undefined); }
		else if (vnodes == null) { removeNodes(old, 0, old.length, vnodes); }
		else {
			if (old.length === vnodes.length) {
				let isUnkeyed = false;
				for (var i = 0; i < vnodes.length; i++) {
					if (vnodes[i] != null && old[i] != null) {
						isUnkeyed = vnodes[i].key == null && old[i].key == null;
						break;
					}
				}
				if (isUnkeyed) {
					for (var i = 0; i < old.length; i++) {
						if (old[i] === vnodes[i]) { continue; }
						else if (old[i] == null && vnodes[i] != null) { createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling)); }
						else if (vnodes[i] == null) { removeNodes(old, i, i + 1, vnodes); }
						else { updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns); }
					}
					return;
				}
			}
			recycling = recycling || isRecyclable(old, vnodes);
			if (recycling) {
				var pool = old.pool;
				old = old.concat(old.pool);
			}
			let oldStart = 0, 
start = 0, 
oldEnd = old.length - 1, 
end = vnodes.length - 1, 
map;
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldStart], 
v = vnodes[start];
				if (o === v && !recycling) { oldStart++, start++; }
				else if (o == null) { oldStart++; }
				else if (v == null) { start++; }
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling);
					oldStart++, start++;
					updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns);
					if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
				}
				else {
					var o = old[oldEnd];
					if (o === v && !recycling) { oldEnd--, start++; }
					else if (o == null) { oldEnd--; }
					else if (v == null) { start++; }
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling);
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns);
						if (recycling || start < end) { insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling)); }
						oldEnd--, start++;
					}
					else { break; }
				}
			}
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldEnd], 
v = vnodes[end];
				if (o === v && !recycling) { oldEnd--, end--; }
				else if (o == null) { oldEnd--; }
				else if (v == null) { end--; }
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling);
					updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns);
					if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
					if (o.dom != null) { nextSibling = o.dom; }
					oldEnd--, end--;
				}
				else {
					if (!map) { map = getKeyMap(old, oldEnd); }
					if (v != null) {
						const oldIndex = map[v.key];
						if (oldIndex != null) {
							const movable = old[oldIndex];
							var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling);
							updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
							insertNode(parent, toFragment(movable), nextSibling);
							old[oldIndex].skip = true;
							if (movable.dom != null) { nextSibling = movable.dom; }
						}
						else {
							const dom = createNode(parent, v, hooks, undefined, nextSibling);
							nextSibling = dom;
						}
					}
					end--;
				}
				if (end < start) { break; }
			}
			createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
			removeNodes(old, oldStart, oldEnd + 1, vnodes);
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		let oldTag = old.tag, 
tag = vnode.tag;
		if (oldTag === tag) {
			vnode.state = old.state;
			vnode._state = old._state;
			vnode.events = old.events;
			if (!recycling && shouldNotUpdate(vnode, old)) { return; }
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					if (recycling) {
						vnode.state = {};
						initLifecycle(vnode.attrs, vnode, hooks);
					}
					else { updateLifecycle(vnode.attrs, vnode, hooks); }
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break;
					case "<": updateHTML(parent, old, vnode, nextSibling); break;
					case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break;
					default: updateElement(old, vnode, recycling, hooks, ns);
				}
			}
			else { updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns); }
		}
		else {
			removeNode(old, null);
			createNode(parent, vnode, hooks, ns, nextSibling);
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children;
		}
		vnode.dom = old.dom;
	}
	function updateHTML(parent, old, vnode, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old);
			createHTML(parent, vnode, nextSibling);
		}
		else { vnode.dom = old.dom, vnode.domSize = old.domSize; }
	}
	function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns);
		let domSize = 0, 
children = vnode.children;
		vnode.dom = null;
		if (children != null) {
			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				if (child != null && child.dom != null) {
					if (vnode.dom == null) { vnode.dom = child.dom; }
					domSize += child.domSize || 1;
				}
			}
			if (domSize !== 1) { vnode.domSize = domSize; }
		}
	}
	function updateElement(old, vnode, recycling, hooks, ns) {
		const element = vnode.dom = old.dom;
		switch (vnode.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break;
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break;
		}
		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) { vnode.attrs = {}; }
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text; //FIXME handle0 multiple children
				vnode.text = undefined;
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns);
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode);
		}
		else if (old.text != null && vnode.text != null && vnode.text !== "") {
			if (old.text.toString() !== vnode.text.toString()) { old.dom.firstChild.nodeValue = vnode.text; }
		}
		else {
			if (old.text != null) { old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]; }
			if (vnode.text != null) { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
			updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns);
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		if (recycling) {
			initComponent(vnode, hooks);
		} else {
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode));
			if (vnode.instance === vnode) { throw Error("A view cannot return the vnode it received as argument"); }
			if (vnode.attrs != null) { updateLifecycle(vnode.attrs, vnode, hooks); }
			updateLifecycle(vnode._state, vnode, hooks);
		}
		if (vnode.instance != null) {
			if (old.instance == null) { createNode(parent, vnode.instance, hooks, ns, nextSibling); }
			else { updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns); }
			vnode.dom = vnode.instance.dom;
			vnode.domSize = vnode.instance.domSize;
		}
		else if (old.instance != null) {
			removeNode(old.instance, null);
			vnode.dom = undefined;
			vnode.domSize = 0;
		}
		else {
			vnode.dom = old.dom;
			vnode.domSize = old.domSize;
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			const oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0;
			const poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0;
			const vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0;
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true;
			}
		}
		return false;
	}
	function getKeyMap(vnodes, end) {
		var map = {}, 
i = 0;
		for (var i = 0; i < end; i++) {
			const vnode = vnodes[i];
			if (vnode != null) {
				const key2 = vnode.key;
				if (key2 != null) { map[key2] = i; }
			}
		}
		return map;
	}
	function toFragment(vnode) {
		let count0 = vnode.domSize;
		if (count0 != null || vnode.dom == null) {
			const fragment = $doc.createDocumentFragment();
			if (count0 > 0) {
				const dom = vnode.dom;
				while (--count0) { fragment.appendChild(dom.nextSibling); }
				fragment.insertBefore(dom, fragment.firstChild);
			}
			return fragment;
		}
		return vnode.dom;
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) { return vnodes[i].dom; }
		}
		return nextSibling;
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) { parent.insertBefore(dom, nextSibling); }
		else { parent.appendChild(dom); }
	}
	function setContentEditable(vnode) {
		const children = vnode.children;
		if (children != null && children.length === 1 && children[0].tag === "<") {
			const content = children[0].children;
			if (vnode.dom.innerHTML !== content) { vnode.dom.innerHTML = content; }
		}
		else if (vnode.text != null || children != null && children.length !== 0) { throw new Error("Child node of a contenteditable must be trusted"); }
	}
	//remove
	function removeNodes(vnodes, start, end, context) {
		for (let i = start; i < end; i++) {
			const vnode = vnodes[i];
			if (vnode != null) {
				if (vnode.skip) { vnode.skip = false; }
				else { removeNode(vnode, context); }
			}
		}
	}
	function removeNode(vnode, context) {
		let expected = 1, 
called = 0;
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
			var result = vnode._state.onbeforeremove.call(vnode.state, vnode);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		continuation();
		function continuation() {
			if (++called === expected) {
				onremove(vnode);
				if (vnode.dom) {
					let count0 = vnode.domSize || 1;
					if (count0 > 1) {
						const dom = vnode.dom;
						while (--count0) {
							removeNodeFromDOM(dom.nextSibling);
						}
					}
					removeNodeFromDOM(vnode.dom);
					if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
						if (!context.pool) { context.pool = [vnode]; }
						else { context.pool.push(vnode); }
					}
				}
			}
		}
	}
	function removeNodeFromDOM(node) {
		const parent = node.parentNode;
		if (parent != null) { parent.removeChild(node); }
	}
	function onremove(vnode) {
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") { vnode.attrs.onremove.call(vnode.state, vnode); }
		if (typeof vnode.tag !== "string" && typeof vnode._state.onremove === "function") { vnode._state.onremove.call(vnode.state, vnode); }
		if (vnode.instance != null) { onremove(vnode.instance); }
		else {
			const children = vnode.children;
			if (Array.isArray(children)) {
				for (let i = 0; i < children.length; i++) {
					const child = children[i];
					if (child != null) { onremove(child); }
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode, attrs2, ns) {
		for (const key2 in attrs2) {
			setAttr(vnode, key2, null, attrs2[key2], ns);
		}
	}
	function setAttr(vnode, key2, old, value, ns) {
		const element = vnode.dom;
		if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) { return; }
		const nsLastIndex = key2.indexOf(":");
		if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value);
		}
		else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") { updateEvent(vnode, key2, value); }
		else if (key2 === "style") { updateStyle(element, old, value); }
		else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
			//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
			if (vnode.tag === "input" && key2 === "value" && vnode.dom.value == value && vnode.dom === $doc.activeElement) { return; }
			//setting select[value] to same value while having select open blinks select dropdown in Chrome
			if (vnode.tag === "select" && key2 === "value" && vnode.dom.value == value && vnode.dom === $doc.activeElement) { return; }
			//setting option[value] to same value while having select open blinks select dropdown in Chrome
			if (vnode.tag === "option" && key2 === "value" && vnode.dom.value == value) { return; }
			// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
			if (vnode.tag === "input" && key2 === "type") {
				element.setAttribute(key2, value);
				return;
			}
			element[key2] = value;
		}
		else if (typeof value === "boolean") {
				if (value) { element.setAttribute(key2, ""); }
				else { element.removeAttribute(key2); }
			}
			else { element.setAttribute(key2 === "className" ? "class" : key2, value); }
	}
	function setLateAttrs(vnode) {
		const attrs2 = vnode.attrs;
		if (vnode.tag === "select" && attrs2 != null) {
			if ("value" in attrs2) { setAttr(vnode, "value", null, attrs2.value, undefined); }
			if ("selectedIndex" in attrs2) { setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined); }
		}
	}
	function updateAttrs(vnode, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, old && old[key2], attrs2[key2], ns);
			}
		}
		if (old != null) {
			for (var key2 in old) {
				if (attrs2 == null || !(key2 in attrs2)) {
					if (key2 === "className") { key2 = "class"; }
					if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) { updateEvent(vnode, key2, undefined); }
					else if (key2 !== "key") { vnode.dom.removeAttribute(key2); }
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement;
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate";
	}
	function isAttribute(attr) {
		return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height";// || attr === "type"
	}
	function isCustomElement(vnode){
		return vnode.attrs.is || vnode.tag.indexOf("-") > -1;
	}
	function hasIntegrationMethods(source) {
		return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove);
	}
	//style
	function updateStyle(element, old, style) {
		if (old === style) { element.style.cssText = "", old = null; }
		if (style == null) { element.style.cssText = ""; }
		else if (typeof style === "string") { element.style.cssText = style; }
		else {
			if (typeof old === "string") { element.style.cssText = ""; }
			for (var key2 in style) {
				element.style[key2] = style[key2];
			}
			if (old != null && typeof old !== "string") {
				for (var key2 in old) {
					if (!(key2 in style)) { element.style[key2] = ""; }
				}
			}
		}
	}
	//event
	function updateEvent(vnode, key2, value) {
		const element = vnode.dom;
		const callback = typeof onevent !== "function" ? value : function(e) {
			const result = value.call(element, e);
			onevent.call(element, e);
			return result;
		};
		if (key2 in element) { element[key2] = typeof value === "function" ? callback : null; }
		else {
			const eventName = key2.slice(2);
			if (vnode.events === undefined) { vnode.events = {}; }
			if (vnode.events[key2] === callback) { return; }
			if (vnode.events[key2] != null) { element.removeEventListener(eventName, vnode.events[key2], false); }
			if (typeof value === "function") {
				vnode.events[key2] = callback;
				element.addEventListener(eventName, vnode.events[key2], false);
			}
		}
	}
	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") { source.oninit.call(vnode.state, vnode); }
		if (typeof source.oncreate === "function") { hooks.push(source.oncreate.bind(vnode.state, vnode)); }
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") { hooks.push(source.onupdate.bind(vnode.state, vnode)); }
	}
	function shouldNotUpdate(vnode, old) {
		let forceVnodeUpdate, forceComponentUpdate;
		if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") { forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old); }
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") { forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old); }
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode.dom = old.dom;
			vnode.domSize = old.domSize;
			vnode.instance = old.instance;
			return true;
		}
		return false;
	}
	function render(dom, vnodes) {
		if (!dom) { throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined."); }
		const hooks = [];
		const active = $doc.activeElement;
		// First time0 rendering into a node clears it out
		if (dom.vnodes == null) { dom.textContent = ""; }
		if (!Array.isArray(vnodes)) { vnodes = [vnodes]; }
		updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, undefined);
		dom.vnodes = vnodes;
		for (let i = 0; i < hooks.length; i++) { hooks[i](); }
		if ($doc.activeElement !== active) { active.focus(); }
	}
	return {render: render, setEventCallback: setEventCallback};
};
function throttle(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	const time = 16;
	let last = 0, 
pending = null;
	const timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
	return function() {
		const now = Date.now();
		if (last === 0 || now - last >= time) {
			last = now;
			callback();
		}
		else if (pending === null) {
			pending = timeout(() => {
				pending = null;
				callback();
				last = Date.now();
			}, time - (now - last));
		}
	};
}
const _11 = function($window) {
	const renderService = coreRenderer($window);
	renderService.setEventCallback((e) => {
		if (e.redraw !== false) { redraw(); }
	});
	const callbacks = [];
	function subscribe(key1, callback) {
		unsubscribe(key1);
		callbacks.push(key1, throttle(callback));
	}
	function unsubscribe(key1) {
		const index = callbacks.indexOf(key1);
		if (index > -1) { callbacks.splice(index, 2); }
	}
	function redraw() {
		for (let i = 1; i < callbacks.length; i += 2) {
			callbacks[i]();
		}
	}
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render};
};
const redrawService = _11(window);
requestService.setCompletionCallback(redrawService.redraw);
const _16 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, []);
			redrawService0.unsubscribe(root);
			return;
		}
		
		if (component.view == null && typeof component !== "function") { throw new Error("m.mount(element, component) expects a component, not a vnode"); }
		
		const run0 = function() {
			redrawService0.render(root, Vnode(component));
		};
		redrawService0.subscribe(root, run0);
		redrawService0.redraw();
	};
};
m.mount = _16(redrawService);
const Promise = PromisePolyfill;
const parseQueryString = function(string) {
	if (string === "" || string == null) { return {}; }
	if (string.charAt(0) === "?") { string = string.slice(1); }
	let entries = string.split("&"), 
data0 = {}, 
counters = {};
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i].split("=");
		var key5 = decodeURIComponent(entry[0]);
		let value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
		if (value === "true") { value = true; }
		else if (value === "false") { value = false; }
		const levels = key5.split(/\]\[?|\[/);
		let cursor = data0;
		if (key5.indexOf("[") > -1) { levels.pop(); }
		for (let j = 0; j < levels.length; j++) {
			let level = levels[j], 
nextLevel = levels[j + 1];
			const isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
			const isValue = j === levels.length - 1;
			if (level === "") {
				var key5 = levels.slice(0, j).join();
				if (counters[key5] == null) { counters[key5] = 0; }
				level = counters[key5]++;
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {};
			}
			cursor = cursor[level];
		}
	}
	return data0;
};
const coreRouter = function($window) {
	const supportsPushState = typeof $window.history.pushState === "function";
	const callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function normalize1(fragment0) {
		let data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
		if (fragment0 === "pathname" && data[0] !== "/") { data = `/${data}`; }
		return data;
	}
	let asyncId;
	function debounceAsync(callback0) {
		return function() {
			if (asyncId != null) { return; }
			asyncId = callAsync0(() => {
				asyncId = null;
				callback0();
			});
		};
	}
	function parsePath(path, queryData, hashData) {
		const queryIndex = path.indexOf("?");
		const hashIndex = path.indexOf("#");
		const pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length;
		if (queryIndex > -1) {
			const queryEnd = hashIndex > -1 ? hashIndex : path.length;
			const queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd));
			for (var key4 in queryParams) { queryData[key4] = queryParams[key4]; }
		}
		if (hashIndex > -1) {
			const hashParams = parseQueryString(path.slice(hashIndex + 1));
			for (var key4 in hashParams) { hashData[key4] = hashParams[key4]; }
		}
		return path.slice(0, pathEnd);
	}
	const router = {prefix: "#!"};
	router.getPath = function() {
		const type2 = router.prefix.charAt(0);
		switch (type2) {
			case "#": return normalize1("hash").slice(router.prefix.length);
			case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash");
			default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash");
		}
	};
	router.setPath = function(path, data, options) {
		let queryData = {}, 
hashData = {};
		path = parsePath(path, queryData, hashData);
		if (data != null) {
			for (const key4 in data) { queryData[key4] = data[key4]; }
			path = path.replace(/:([^\/]+)/g, (match2, token) => {
				delete queryData[token];
				return data[token];
			});
		}
		const query = buildQueryString(queryData);
		if (query) { path += `?${query}`; }
		const hash = buildQueryString(hashData);
		if (hash) { path += `#${hash}`; }
		if (supportsPushState) {
			const state = options ? options.state : null;
			const title = options ? options.title : null;
			$window.onpopstate();
			if (options && options.replace) { $window.history.replaceState(state, title, router.prefix + path); }
			else { $window.history.pushState(state, title, router.prefix + path); }
		}
		else { $window.location.href = router.prefix + path; }
	};
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			const path = router.getPath();
			const params = {};
			const pathname = parsePath(path, params, params);
			const state = $window.history.state;
			if (state != null) {
				for (const k in state) { params[k] = state[k]; }
			}
			for (var route0 in routes) {
				const matcher = new RegExp(`^${route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)")}\/?$`);
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						const keys = route0.match(/:[^\/]+/g) || [];
						const values = [].slice.call(arguments, 1, -2);
						for (let i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i]);
						}
						resolve(routes[route0], params, path, route0);
					});
					return;
				}
			}
			reject(path, params);
		}
		if (supportsPushState) { $window.onpopstate = debounceAsync(resolveRoute); }
		else if (router.prefix.charAt(0) === "#") { $window.onhashchange = resolveRoute; }
		resolveRoute();
	};
	return router;
};
const _20 = function($window, redrawService0) {
	const routeService = coreRouter($window);
	const identity = function(v) { return v; };
	let render1, component, attrs3, currentPath, lastUpdate;
	const route = function(root, defaultRoute, routes) {
		if (root == null) { throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined"); }
		const run1 = function() {
			if (render1 != null) { redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3))); }
		};
		const bail = function(path) {
			if (path !== defaultRoute) { routeService.setPath(defaultRoute, null, {replace: true}); }
			else { throw new Error(`Could not resolve default route ${defaultRoute}`); }
		};
		routeService.defineRoutes(routes, (payload, params, path) => {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) { return; }
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
				attrs3 = params, currentPath = path, lastUpdate = null;
				render1 = (routeResolver.render || identity).bind(routeResolver);
				run1();
			};
			if (payload.view || typeof payload === "function") { update({}, payload); }
			else if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then((resolved) => {
						update(payload, resolved);
					}, bail);
				}
				else { update(payload, "div"); }
		}, bail);
		redrawService0.subscribe(root, run1);
	};
	route.set = function(path, data, options) {
		if (lastUpdate != null) { options = {replace: true}; }
		lastUpdate = null;
		routeService.setPath(path, data, options);
	};
	route.get = function() { return currentPath; };
	route.prefix = function(prefix0) { routeService.prefix = prefix0; };
	route.link = function(vnode1) {
		vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href);
		vnode1.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) { return; }
			e.preventDefault();
			e.redraw = false;
			let href = this.getAttribute("href");
			if (href.indexOf(routeService.prefix) === 0) { href = href.slice(routeService.prefix.length); }
			route.set(href, undefined, undefined);
		};
	};
	route.param = function(key3) {
		if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") { return attrs3[key3]; }
		return attrs3;
	};
	return route;
};
m.route = _20(window, redrawService);
m.withAttr = function(attrName, callback1, context) {
	return function(e) {
		callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName));
	};
};
const _28 = coreRenderer(window);
m.render = _28.render;
m.redraw = redrawService.redraw;
m.request = requestService.request;
m.jsonp = requestService.jsonp;
m.parseQueryString = parseQueryString;
m.buildQueryString = buildQueryString;
m.version = "1.1.1";
m.vnode = Vnode;
if (typeof module !== "undefined") { module["exports"] = m; }
else { window.m = m; }
export { m };
//}()); //#FC
