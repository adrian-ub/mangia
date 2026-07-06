const { publishFacade } = await import("virtual:mangia/ng-compiler");
publishFacade(globalThis);
const __handler = await import("./entry-server-handler");
export default __handler.default;
