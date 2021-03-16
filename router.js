// class Router {
//     routes = [];
//     mode = null;
//     root = "/";
//
//     constructor(window, options) {
//         this.window = window;
//         this.mode = this.window.history.pushState ? "history" : "hash";
//         if (options.mode) this.mode = options.mode;
//         if (options.root) this.root = options.root;
//
//         this.listen();
//     }
//
//     clearSlashes = path =>
//         path
//             .toString()
//             .replace(/\/$/, '')
//             .replace(/^\//, '')
//
//     getFragment = () => {
//         let fragment = ''
//
//         if (this.mode === 'history') {
//             fragment = this.clearSlashes(decodeURI(window.location.pathname + window.location.search))
//             fragment = fragment.replace(/\?(.*)$/, '')
//             fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment
//         } else {
//             const match = window.location.href.match(/#(.*)$/)
//             fragment = match ? match[1] : ''
//         }
//         return this.clearSlashes(fragment)
//     }
//
//     getFragment = () => {
//         let fragment = ''
//
//         if (this.mode === 'history') {
//             fragment = this.clearSlashes(decodeURI(this.window.location.pathname + this.window.location.search))
//             fragment = fragment.replace(/\?(.*)$/, '')
//             fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment
//         } else {
//             const match = this.window.location.href.match(/#(.*)$/)
//             fragment = match ? match[1] : ''
//         }
//         return this.clearSlashes(fragment)
//     }
//
//     navigate = (path = '') => {
//         if (this.mode === 'history') {
//             this.window.history.pushState(null, null, this.root + this.clearSlashes(path))
//         } else {
//             this.window.location.href = `${this.window.location.href.replace(/#(.*)$/, '')}#${path}`
//         }
//         return this
//     }
//
//     listen = () => {
//         clearInterval(this.interval)
//         this.interval = setInterval(this.interval, 50)
//     }
//
//     interval = () => {
//         if (this.current === this.getFragment()) return
//         this.current = this.getFragment()
//
//         this.routes.some(route => {
//             const match = this.current.match(route.path)
//
//             if (match) {
//                 match.shift()
//                 route.cb.apply({}, match)
//                 return match
//             }
//             return false
//         })
//     }
// }
//
// module.exports = { Router }
