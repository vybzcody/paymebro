
Error: An unexpected error occurred spoofer.js:1:38935
[vite] connecting... client:495:9
[vite] connected. client:618:15
Warning: The result of getSnapshot should be cached to avoid an infinite loop Component Stack: 
    Landing Landing.tsx:36
    RenderedRoute hooks.tsx:658
    Routes components.tsx:514
    AppRoutes unknown:0
    div unknown:0
    Router components.tsx:428
    BrowserRouter index.tsx:793
    Provider create-context.tsx:59
    TooltipProvider tooltip.tsx:73
    Web3AuthProvider Web3AuthContext.tsx:79
    QueryClientProvider QueryClientProvider.tsx:29
    App unknown:0
<anonymous code>:1:145535
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. Component Stack: 
    BrowserRouter index.tsx:793
    Provider create-context.tsx:59
    TooltipProvider tooltip.tsx:73
    Web3AuthProvider Web3AuthContext.tsx:79
    QueryClientProvider QueryClientProvider.tsx:29
    App unknown:0
<anonymous code>:1:145535
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. Component Stack: 
    BrowserRouter index.tsx:793
    Provider create-context.tsx:59
    TooltipProvider tooltip.tsx:73
    Web3AuthProvider Web3AuthContext.tsx:79
    QueryClientProvider QueryClientProvider.tsx:29
    App unknown:0
<anonymous code>:1:145535
Initializing Web3Auth... Web3AuthContext.tsx:176:17
Calling web3auth.initModal()... Web3AuthContext.tsx:202:17
Uncaught Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
    React 19
    workLoop scheduler.development.js:266
    flushWork scheduler.development.js:239
    performWorkUntilDeadline scheduler.development.js:533
    js scheduler.development.js:571
    js scheduler.development.js:633
    __require2 chunk-OL46QLBJ.js:21
    js index.js:6
    __require2 chunk-OL46QLBJ.js:21
    React 2
    __require2 chunk-OL46QLBJ.js:21
    js React
    __require2 chunk-OL46QLBJ.js:21
    js React
    __require2 chunk-OL46QLBJ.js:21
    <anonymous> react-dom_client.js:7
react-dom.development.js:27331:11
The above error occurred in the <Landing> component:

Landing@http://localhost:8080/src/pages/Landing.tsx:29:21
RenderedRoute@http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=36a05844:4091:7
Routes@http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=36a05844:4560:7
AppRoutes
div
Router@http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=36a05844:4508:7
BrowserRouter@http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=36a05844:5251:7
Provider@http://localhost:8080/node_modules/.vite/deps/chunk-XOUBXFGS.js?v=36a05844:38:47
TooltipProvider@http://localhost:8080/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=36a05844:68:7
Web3AuthProvider@http://localhost:8080/src/contexts/Web3AuthContext.tsx:73:33
QueryClientProvider@http://localhost:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=36a05844:2933:27
App

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries. <anonymous code>:1:145535
Uncaught Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
    React 19
    workLoop scheduler.development.js:266
    flushWork scheduler.development.js:239
    performWorkUntilDeadline scheduler.development.js:533
    js scheduler.development.js:571
    js scheduler.development.js:633
    __require2 chunk-OL46QLBJ.js:21
    js index.js:6
    __require2 chunk-OL46QLBJ.js:21
    React 2
    __require2 chunk-OL46QLBJ.js:21
    js React
    __require2 chunk-OL46QLBJ.js:21
    js React
    __require2 chunk-OL46QLBJ.js:21
    <anonymous> react-dom_client.js:7
react-dom.development.js:27331:11
    React 19
    workLoop scheduler.development.js:266
    flushWork scheduler.development.js:239
    performWorkUntilDeadline scheduler.development.js:533
    (Async: EventHandlerNonNull)
    js scheduler.development.js:571
    js scheduler.development.js:633
    __require2 chunk-OL46QLBJ.js:21
    js index.js:6
    __require2 chunk-OL46QLBJ.js:21
    React 2
    __require2 chunk-OL46QLBJ.js:21
    js React
    __require2 chunk-OL46QLBJ.js:21
    js React
    __require2 chunk-OL46QLBJ.js:21
    <anonymous> react-dom_client.js:7
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1066:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:8080/%3Canonymous%20code%3E
Source Map URL: installHook.js.map

 WARNING! You are on sapphire_devnet. Please set network: 'mainnet' or 'sapphire_mainnet' in production auth.js:118:15
Web3Auth modal initialized successfully Web3AuthContext.tsx:204:17
No existing session found Web3AuthContext.tsx:241:19

​

