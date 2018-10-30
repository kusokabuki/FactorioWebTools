"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TrainApp = function (_React$Component) {
    _inherits(TrainApp, _React$Component);

    function TrainApp(props) {
        _classCallCheck(this, TrainApp);

        var _this = _possibleConstructorReturn(this, (TrainApp.__proto__ || Object.getPrototypeOf(TrainApp)).call(this, props));

        _this.fuels = [{ name: "石炭", acc_mult: 1, top_speed_mult: 1 }, { name: "固形燃料", acc_mult: 1.2, top_speed_mult: 1.05 }, { name: "ロケット燃料", acc_mult: 1.8, top_speed_mult: 1.15 }, { name: "核燃料", acc_mult: 2.5, top_speed_mult: 1.15 }];

        _this.state = {
            fuel: 0,
            locomotives_actives: 1,
            locomotives_inavtives: 0,
            wagons: 0,
            Leadertype: 0 //0=locomotive, 1=cargo        
        };

        return _this;
    }

    _createClass(TrainApp, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var _calculate = this.calculate(),
                maxSpeed = _calculate.maxSpeed,
                tick_reached_max = _calculate.tick_reached_max,
                distance = _calculate.distance,
                weight = _calculate.weight;

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "label",
                        null,
                        "\u71C3\u6599\uFF1A"
                    ),
                    React.createElement(
                        "select",
                        {
                            value: this.state.fuel,
                            onChange: function onChange(e) {
                                return _this2.setState({ fuel: e.target.value });
                            }
                        },
                        this.fuels.map(function (f, i) {
                            return React.createElement(
                                "option",
                                { key: i, value: i },
                                f.name
                            );
                        })
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "label",
                        null,
                        "\u524D\u5411\u304D\u6A5F\u95A2\u8ECA\uFF1A",
                        React.createElement("input", { type: "number", min: "1", value: this.state.locomotives_actives, onChange: function onChange(e) {
                                return _this2.setState({ locomotives_actives: Number.parseInt(e.target.value) });
                            } })
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "label",
                        null,
                        "\u5F8C\u5411\u304D\u6A5F\u95A2\u8ECA\uFF1A",
                        React.createElement("input", { type: "number", min: "0", value: this.state.locomotives_inavtives, onChange: function onChange(e) {
                                return _this2.setState({ locomotives_inavtives: Number.parseInt(e.target.value) });
                            } })
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "label",
                        null,
                        "\u8CA8\u8ECA\uFF1A",
                        React.createElement("input", { type: "number", min: "0", value: this.state.wagons, onChange: function onChange(e) {
                                return _this2.setState({ wagons: Number.parseInt(e.target.value) });
                            } })
                    ),
                    React.createElement("br", null)
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "label",
                        null,
                        "\u5148\u982D\u8ECA\u4E21\u306E\u7A2E\u985E\uFF1A"
                    ),
                    React.createElement("input", { type: "radio", value: "0", checked: this.state.Leadertype === 0,
                        onChange: function onChange(e) {
                            return _this2.setState({ Leadertype: 0 });
                        } }),
                    "\u6A5F\u95A2\u8ECA",
                    React.createElement("input", { type: "radio", value: "1", checked: this.state.Leadertype === 1,
                        onChange: function onChange(e) {
                            return _this2.setState({ Leadertype: 1 });
                        } }),
                    "\u8CA8\u8ECA"
                ),
                React.createElement("hr", null),
                React.createElement(
                    "table",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "\u6700\u9AD8\u901F\u5EA6\u306B\u5230\u9054\u3059\u308B\u8DDD\u96E2"
                        ),
                        React.createElement(
                            "td",
                            null,
                            distance,
                            " m"
                        )
                    ),
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "\u30EC\u30FC\u30EB\u63DB\u7B97"
                        ),
                        React.createElement(
                            "td",
                            null,
                            Math.ceil(distance / 2),
                            " \u500B"
                        )
                    ),
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "\u6642\u9593"
                        ),
                        React.createElement(
                            "td",
                            null,
                            tick_reached_max / 60,
                            " \u79D2"
                        )
                    ),
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "\u6700\u9AD8\u901F\u5EA6"
                        ),
                        React.createElement(
                            "td",
                            null,
                            maxSpeed * 60 * 60 * 60 / 1000,
                            " km/h"
                        )
                    ),
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "\u7DCF\u91CD\u91CF"
                        ),
                        React.createElement(
                            "td",
                            null,
                            weight,
                            " kg"
                        )
                    )
                )
            );
        }
    }, {
        key: "calculate",
        value: function calculate() {
            // 機関車数
            var locomotives = this.state.locomotives_actives + this.state.locomotives_inavtives;
            // 総車両数
            var rollingStocks = locomotives + this.state.wagons;
            // 総重量（単位:kg）
            var weight = locomotives * 2000 + this.state.wagons * 1000;

            // 動力(単位:kJ)
            var energy = this.state.locomotives_actives * 10;
            // 空気抵抗
            var airResistance = this.state.Leadertype == 0 ? 0.0075 : 0.01;

            // 燃料の加速ボーナスと最高速度
            var _fuels$state$fuel = this.fuels[this.state.fuel],
                acc_mult = _fuels$state$fuel.acc_mult,
                top_speed_mult = _fuels$state$fuel.top_speed_mult;

            var maxSpeed = 1.2 * top_speed_mult;

            // 出発時から n tick目の速度を v(n)、
            // n tick目で空気抵抗なしで加速した場合の速度を v'(n)とすると
            //   v'(n) = v(n) + (動力 - 摩擦) / 重量
            //   v(n + 1) = v'(n) - v'(n) * 空気抵抗 / 重量
            // v'(n)を取り除くと
            //   v(n+1) = (v(n) + (動力 - 摩擦) / 重量) / (1 - 空気抵抗 / 重量)
            // (1 - 空気抵抗 / 重量)を p, (動力 - 摩擦) / 重量) / p を q とすると
            //   v(n+1) = p * v(n) + q
            // 漸化式の一般項より
            //   v(n) = (v(1) - a) * p ^ (n - 1) + a
            //             (a = q / (1 - p))
            // 最高速度 max に達するのは v(n_max) > max のときなのでこれを n_max について解くと
            //   (v1 - a) * p ^ (n_max - 1) + a > max
            //   n_max > log_p((max - a) * p / (v1 - a)
            // 現在位置は各tickごと速度v(n) だけ移動するので n tick 後の位置は
            //   ∑ v(k) {k = 1,n}
            //   = (v1 - a) * (p ^ n - 1) / (p - 1) + n * a
            // 以上により最高速度到達時の位置を計算できる

            var p = 1 - airResistance / weight * 1000;
            var q = (energy * acc_mult - 0.5 * rollingStocks) / weight * p;
            var v1 = energy * acc_mult / weight * p;
            var a = q / (1 - p);
            var maxn = Math.log((maxSpeed - a) * p / (v1 - a)) / Math.log(p);
            var distance = (v1 - a) * (Math.pow(p, maxn) - 1) / (p - 1) + maxn * a;

            return {
                maxSpeed: maxSpeed,
                tick_reached_max: maxn,
                distance: distance,
                weight: weight
            };
        }
    }]);

    return TrainApp;
}(React.Component);

ReactDOM.render(React.createElement(TrainApp, null), document.getElementById("app"));