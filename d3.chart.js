
(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('../node_modules/datamap/src/datamap', factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.DataMap = factory();
    }
}(this, function () {
    'use strict';
    var hasDefineProp = function () {
            var obj = {};
            try {
                Object.defineProperty(obj, 'test', {
                    get: function () {
                        return true;
                    }
                });
            } catch (err) {
                return false;
            }
            return !!obj.test;
        }();
    var toString = Object.prototype.toString;
    var isArray = Array.isArray || function (value) {
            return value && typeof value == 'object' && typeof value.length == 'number' && toString.call(value) == '[object Array]' || false;
        };
    var wrapDataImpls = {
            ES5: function (dataPoint) {
                if (typeof dataPoint !== 'object') {
                    return dataPoint;
                }
                var dataProxy = Object.create(this.proxy);
                if (dataPoint instanceof DataProxy) {
                    dataProxy = Object.create(dataPoint);
                }
                dataProxy._dataPoint = dataPoint;
                return dataProxy;
            },
            legacy: function (dataPoint) {
                var dataProxy, getter, dataMapping;
                if (typeof dataPoint !== 'object') {
                    return dataPoint;
                }
                dataProxy = {};
                dataMapping = this._dataMapping;
                if (!dataMapping) {
                    this.attrs.forEach(function (key) {
                        dataProxy[key] = dataPoint[key];
                    });
                } else {
                    this.attrs.forEach(function (key) {
                        getter = dataMapping[key];
                        if (getter) {
                            dataProxy[key] = getter.call(dataPoint);
                        } else {
                            dataProxy[key] = dataPoint[key];
                        }
                    }, this);
                }
                return dataProxy;
            }
        };
    var wrapData = wrapDataImpls[hasDefineProp ? 'ES5' : 'legacy'];
    function DataProxy() {
    }
    var createDataProxy = function (attributes) {
        var proxy = new DataProxy();
        if (attributes) {
            attributes.forEach(function (attr) {
                var getter = function () {
                    return this._dataPoint[attr];
                };
                if (hasDefineProp) {
                    Object.defineProperty(proxy, attr, {
                        get: getter,
                        configurable: true
                    });
                } else {
                    proxy[attr] = getter;
                }
            }, this);
        }
        return proxy;
    };
    function DataMap(attrs) {
        this.attrs = attrs;
        this.proxy = createDataProxy(attrs);
    }
    DataMap.prototype.map = function (table) {
        if (!hasDefineProp) {
            this._dataMapping = table;
        } else {
            Object.keys(table).forEach(function (attr) {
                Object.defineProperty(this.proxy, attr, {
                    get: function () {
                        return table[attr].call(this._dataPoint);
                    }
                });
            }, this);
        }
    };
    DataMap.prototype.wrap = function (input) {
        if (isArray(input)) {
            return input.map(wrapData, this);
        }
        return wrapData.call(this, input);
    };
    return DataMap;
}));
var assert = function () {
        'use strict';
        return function (test, message) {
            if (test) {
                return;
            }
            throw new Error('[d3.chart] ' + message);
        };
    }();
var chart = function (require, node_modules_datamap_src_datamap, assert) {
        'use strict';
        var DataMap = node_modules_datamap_src_datamap;
        var assert = assert;
        var hasOwnProp = Object.hasOwnProperty;
        function extend(object) {
            var argsIndex, argsLength, iteratee, key;
            if (!object) {
                return object;
            }
            argsLength = arguments.length;
            for (argsIndex = 1; argsIndex < argsLength; argsIndex++) {
                iteratee = arguments[argsIndex];
                if (iteratee) {
                    for (key in iteratee) {
                        object[key] = iteratee[key];
                    }
                }
            }
            return object;
        }
        var initCascade = function (instance, args) {
            var ctor = this.constructor;
            var sup = ctor.__super__;
            if (sup) {
                initCascade.call(sup, instance, args);
            }
            if (hasOwnProp.call(ctor.prototype, 'initialize')) {
                this.initialize.apply(instance, args);
            }
        };
        var transformCascade = function (instance, data) {
            var ctor = this.constructor;
            var sup = ctor.__super__;
            if (this === instance && hasOwnProp.call(this, 'transform')) {
                data = this.transform(data);
            }
            if (hasOwnProp.call(ctor.prototype, 'transform')) {
                data = ctor.prototype.transform.call(instance, data);
            }
            if (sup) {
                data = transformCascade.call(sup, instance, data);
            }
            return data;
        };
        var Chart = function (selection, chartOptions) {
            this.base = selection;
            this._dataMapping = chartOptions && chartOptions.dataMapping;
            this._layers = {};
            this._attached = {};
            this._events = {};
            initCascade.call(this, this, Array.prototype.slice.call(arguments, 1));
            if (this._dataMapping !== false) {
                this._datamap = new DataMap(this.dataAttrs);
                if (this._dataMapping) {
                    this._datamap.map(this._dataMapping);
                }
            }
        };
        Chart.prototype.initialize = function () {
        };
        Chart.prototype.unlayer = function (name) {
            var layer = this.layer(name);
            delete this._layers[name];
            delete layer._chart;
            return layer;
        };
        Chart.prototype.layer = function (name, selection, options) {
            var layer;
            if (arguments.length === 1) {
                return this._layers[name];
            }
            if (arguments.length === 2) {
                if (typeof selection.draw === 'function') {
                    selection._chart = this;
                    this._layers[name] = selection;
                    return this._layers[name];
                } else {
                    assert(false, 'When reattaching a layer, the second argument ' + 'must be a d3.chart layer');
                }
            }
            layer = selection.layer(options);
            this._layers[name] = layer;
            selection._chart = this;
            return layer;
        };
        Chart.prototype.attach = function (attachmentName, chart) {
            if (arguments.length === 1) {
                return this._attached[attachmentName];
            }
            this._attached[attachmentName] = chart;
            return chart;
        };
        Chart.prototype.draw = function (data) {
            var layerName, attachmentName, attachmentData;
            if (this._dataMapping !== false && data) {
                data = this._datamap.wrap(data);
            }
            data = transformCascade.call(this, this, data);
            for (layerName in this._layers) {
                this._layers[layerName].draw(data);
            }
            for (attachmentName in this._attached) {
                if (this.demux) {
                    attachmentData = this.demux(attachmentName, data);
                } else {
                    attachmentData = data;
                }
                this._attached[attachmentName].draw(attachmentData);
            }
        };
        Chart.prototype.on = function (name, callback, context) {
            var events = this._events[name] || (this._events[name] = []);
            events.push({
                callback: callback,
                context: context || this,
                _chart: this
            });
            return this;
        };
        Chart.prototype.once = function (name, callback, context) {
            var self = this;
            var once = function () {
                self.off(name, once);
                callback.apply(this, arguments);
            };
            return this.on(name, once, context);
        };
        Chart.prototype.off = function (name, callback, context) {
            var names, n, events, event, i, j;
            if (arguments.length === 0) {
                for (name in this._events) {
                    this._events[name].length = 0;
                }
                return this;
            }
            if (arguments.length === 1) {
                events = this._events[name];
                if (events) {
                    events.length = 0;
                }
                return this;
            }
            names = name ? [name] : Object.keys(this._events);
            for (i = 0; i < names.length; i++) {
                n = names[i];
                events = this._events[n];
                j = events.length;
                while (j--) {
                    event = events[j];
                    if (callback && callback === event.callback || context && context === event.context) {
                        events.splice(j, 1);
                    }
                }
            }
            return this;
        };
        Chart.prototype.trigger = function (name) {
            var args = Array.prototype.slice.call(arguments, 1);
            var events = this._events[name];
            var i, ev;
            if (events !== undefined) {
                for (i = 0; i < events.length; i++) {
                    ev = events[i];
                    ev.callback.apply(ev.context, args);
                }
            }
            return this;
        };
        Chart.extend = function (name, protoProps, staticProps) {
            var parent = this;
            var child, dataAttrs;
            if (protoProps && hasOwnProp.call(protoProps, 'constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }
            extend(child, parent, staticProps);
            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();
            if (protoProps) {
                extend(child.prototype, protoProps);
            }
            child.__super__ = parent.prototype;
            if (hasOwnProp.call(child.prototype, 'dataAttrs')) {
                dataAttrs = child.prototype.dataAttrs;
            } else {
                dataAttrs = [];
            }
            dataAttrs = dataAttrs.concat(parent.prototype.dataAttrs);
            child.prototype.dataAttrs = dataAttrs;
            Chart[name] = child;
            return child;
        };
        return Chart;
    }({}, DataMap, assert);
var layer = function (require, d3, assert) {
        'use strict';
        var d3 = d3;
        var assert = assert;
        var lifecycleRe = /^(enter|update|merge|exit)(:transition)?$/;
        var Layer = function (base) {
            assert(base, 'Layers must be initialized with a base.');
            this._base = base;
            this._handlers = {};
        };
        Layer.prototype.dataBind = function () {
            assert(false, 'Layers must specify a `dataBind` method.');
        };
        Layer.prototype.insert = function () {
            assert(false, 'Layers must specify an `insert` method.');
        };
        Layer.prototype.on = function (eventName, handler, options) {
            options = options || {};
            assert(lifecycleRe.test(eventName), 'Unrecognized lifecycle event name specified to `Layer#on`: \'' + eventName + '\'.');
            if (!(eventName in this._handlers)) {
                this._handlers[eventName] = [];
            }
            this._handlers[eventName].push({
                callback: handler,
                chart: options.chart || null
            });
            return this._base;
        };
        Layer.prototype.off = function (eventName, handler) {
            var handlers = this._handlers[eventName];
            var idx;
            assert(lifecycleRe.test(eventName), 'Unrecognized lifecycle event name specified to `Layer#off`: \'' + eventName + '\'.');
            if (!handlers) {
                return this._base;
            }
            if (arguments.length === 1) {
                handlers.length = 0;
                return this._base;
            }
            for (idx = handlers.length - 1; idx > -1; --idx) {
                if (handlers[idx].callback === handler) {
                    handlers.splice(idx, 1);
                }
            }
            return this._base;
        };
        Layer.prototype.draw = function (data) {
            var bound, entering, events, selection, handlers, eventName, idx, len;
            bound = this.dataBind.call(this._base, data);
            assert(bound && bound.call === d3.selection.prototype.call, 'Invalid selection defined by `Layer#dataBind` method.');
            assert(bound.enter, 'Layer selection not properly bound.');
            entering = bound.enter();
            entering._chart = this._base._chart;
            events = [
                {
                    name: 'update',
                    selection: bound
                },
                {
                    name: 'enter',
                    selection: this.insert.bind(entering)
                },
                {
                    name: 'merge',
                    selection: bound
                },
                {
                    name: 'exit',
                    selection: bound.exit.bind(bound)
                }
            ];
            for (var i = 0, l = events.length; i < l; ++i) {
                eventName = events[i].name;
                selection = events[i].selection;
                if (typeof selection === 'function') {
                    selection = selection();
                }
                if (selection.empty()) {
                    continue;
                }
                assert(selection && selection.call === d3.selection.prototype.call, 'Invalid selection defined for \'' + eventName + '\' lifecycle event.');
                handlers = this._handlers[eventName];
                if (handlers) {
                    for (idx = 0, len = handlers.length; idx < len; ++idx) {
                        selection._chart = handlers[idx].chart || this._base._chart;
                        selection.call(handlers[idx].callback);
                    }
                }
                handlers = this._handlers[eventName + ':transition'];
                if (handlers && handlers.length) {
                    selection = selection.transition();
                    for (idx = 0, len = handlers.length; idx < len; ++idx) {
                        selection._chart = handlers[idx].chart || this._base._chart;
                        selection.call(handlers[idx].callback);
                    }
                }
            }
        };
        return Layer;
    }({}, d3, assert);
var layer_extensions = function (require, d3, layer) {
        'use strict';
        var d3 = d3;
        var Layer = layer;
        d3.selection.prototype.layer = function (options) {
            var layer = new Layer(this);
            var eventName;
            layer.dataBind = options.dataBind;
            layer.insert = options.insert;
            if ('events' in options) {
                for (eventName in options.events) {
                    layer.on(eventName, options.events[eventName]);
                }
            }
            this.on = function () {
                return layer.on.apply(layer, arguments);
            };
            this.off = function () {
                return layer.off.apply(layer, arguments);
            };
            this.draw = function () {
                return layer.draw.apply(layer, arguments);
            };
            return this;
        };
        return d3.selection.prototype.layer;
    }({}, d3, layer);
var chart_extensions = function (require, d3, chart, assert, layer_extensions) {
        'use strict';
        var d3 = d3;
        var Chart = chart;
        var assert = assert;
        d3.chart = function (name) {
            if (arguments.length === 0) {
                return Chart;
            } else if (arguments.length === 1) {
                return Chart[name];
            }
            return Chart.extend.apply(Chart, arguments);
        };
        d3.selection.prototype.chart = function (chartName, options) {
            if (arguments.length === 0) {
                return this._chart;
            }
            var ChartCtor = Chart[chartName];
            assert(ChartCtor, 'No chart registered with name \'' + chartName + '\'');
            return new ChartCtor(this, options);
        };
        d3.selection.enter.prototype.chart = function () {
            return this._chart;
        };
        d3.transition.prototype.chart = d3.selection.enter.prototype.chart;
        return d3.chart;
    }({}, d3, chart, assert, layer_extensions);