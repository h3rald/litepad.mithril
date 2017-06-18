# LitePad

A simple ES6 nodepad web app powered by [Mithril.js][mithril] and [LiteStore][litestore].

## Features

* Create, edit, view, delete notes.
* Markdown support.
* Fulltext search.
* Two-file setup (LiteStore executable and LiteStore database).
* Run on localhost via LiteStore web server.

## Getting Started

To start using LitePad, simply:

1. Download the [LiteStore][litestore] executable file for your system and place it in a folder or in your $PATH.
2. Do either of the following:
    * Run from a pre-loaded LiteStore datastore:
      1. [Download][release] a LiteStore datastore (`data.db`) pre-loaded with the LitePad web app.
      2. Run `litestore` in the directory containing the `data.db` file.
      3. Navigate to <http://localhost:9500/docs/litepad/index.html>.
    * Run from a source directory:
      1. Clone the [LitePad repository][repo] or download and unpack a [source release][release].
      2. Run `litestore -d:<path-to-LitePad-source-folder>`.
      3. Navigate to <http://localhost:9500/dir/index.html>.

## Browser Support

LitePad makes extensive use of [ES2015][es2015] (ES6) features such as:

* ES modules.
* Classes.
* Constant/local variable definition via `const` and `let`.
* Arrow functions.
* Template literals.

Because of this, LitePad is currently only supported by the following browsers:

* Google Chrome 60 or higher.
* Apple Safari 10.1 or higher.

## Credits

LitePad exists thanks to:

* The [LiteStore][litestore] lightweight document store.
* The [Mithril.js][mithril] Javascript micro framework.
* The [Spectre.css][spectre] CSS framework.
* The [marked][marked] Javascript markdown parser and compiler.
* The [CodeMirror][codemirror] Javascript code editor.
* The [timeago.js][timeago] Javascript date format library.

## License

LitePad is licensed under the [MIT License][license].

[mithril]:https://mithril.js.org/
[litestore]:https://h3rald.com/litestore/
[repo]:https://github.com/h3rald/litepad
[release]:https://github.com/h3rald/litepad/releases
[license]:https://github.com/h3rald/litepad/blob/master/LICENSE
[spectre]:https://picturepan2.github.io/spectre/index.html
[codemirror]:http://codemirror.net/
[timeago]:http://timeago.org/
[marked]:https://github.com/chjj/marked
[es2015]:http://www.ecma-international.org/ecma-262/6.0/