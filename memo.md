# jsxの変換方法
## ツールのインストール
> npm i -g react-tools
## コンパイル
> jsx src/ docs/

### ES5にする場合
> jsx --harmony src/ docs/

### 監視モード
> jsx --watch src/ docs/

# npm のローカルインストールとグローバルインストール
npm install コマンドで-gオプションを使うとグローバル環境にインストールされ、コマンドプロンプトでコマンドが使用可能になる。
つけなかった場合、プロジェクトごとにインストールされnode_modules/.binにコマンドが格納されるがパスは通っていない。
ローカルインストールでこれらのコマンドを使うにはnode_modules/.bin/コマンド名 (/はバックスラッシュにすること)で実行するか、npm scriptsでコマンドを記述する。ここではローカルのコマンドもパスが通る。
npm scriptsはpackage.jsonに記述し、npm run <スクリプト名>で呼び出せる。

# npm＋babel+webpack
## コンパイル
> npm run webpack
## デバッグ+監視モード
> npm run watch
