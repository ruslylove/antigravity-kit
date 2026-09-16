module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},65198,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-efd4e0d5a399fadd");e.n(t),a()}catch(e){a(e)}},!0),24399,e=>{"use strict";function t(){return[{id:"station-bkk-001",name:"Siam Paragon Hub",lat:13.7462,lng:100.5347,status:"Available",powerLimit:"150kW",socketStatus:"Available",currentMeter:0,powerOutput:0},{id:"station-bkk-002",name:"Sukhumvit 21 Fast",lat:13.741,lng:100.56,status:"Charging",powerLimit:"75kW",socketStatus:"Occupied",currentMeter:42.15+5*Math.sin(new Date().getTime()/1e4),powerOutput:68.4+2*Math.random()},{id:"station-bkk-003",name:"Lumphini Park Charging",lat:13.731,lng:100.541,status:"Faulted",powerLimit:"120kW",socketStatus:"Out of Service",currentMeter:12.8,powerOutput:0},{id:"station-bkk-004",name:"Bangkok Old Town Hub",lat:13.753,lng:100.493,status:"Available",powerLimit:"350kW",socketStatus:"Available",currentMeter:0,powerOutput:0},{id:"station-bkk-005",name:"Bangna Complex Ultra-Fast",lat:13.6605,lng:100.6355,status:"Charging",powerLimit:"250kW",socketStatus:"Occupied",currentMeter:125.4,powerOutput:210.5+5*Math.random()},{id:"station-bkk-006",name:"Lat Krabang Factory Charger",lat:13.724,lng:100.7485,status:"Available",powerLimit:"150kW",socketStatus:"Available",currentMeter:0,powerOutput:0},{id:"station-bkk-007",name:"Chatuchak Depot Fleet Charge",lat:13.7985,lng:100.552,status:"Charging",powerLimit:"350kW",socketStatus:"Occupied",currentMeter:312.8,powerOutput:335.2+4*Math.random()},{id:"station-bkk-008",name:"Sukhumvit Distro Station",lat:13.7275,lng:100.569,status:"Reserved",powerLimit:"75kW",socketStatus:"Reserved",currentMeter:0,powerOutput:0},{id:"station-bkk-009",name:"Don Mueang Airport Terminal",lat:13.9126,lng:100.5967,status:"Charging",powerLimit:"120kW",socketStatus:"Occupied",currentMeter:84.1,powerOutput:110.4+3*Math.random()},{id:"station-bkk-010",name:"Mega Bangna Supercharger",lat:13.6468,lng:100.6797,status:"Faulted",powerLimit:"350kW",socketStatus:"Out of Service",currentMeter:45.2,powerOutput:0}]}e.s(["getBaseStations",()=>t])},62061,e=>e.a(async(t,a)=>{try{var r=e.i(65198),s=e.i(24399),n=t([r]);[r]=n.then?(await n)():n;let i=process.env.DATABASE_URL||"postgresql://postgres:Qq1150++@140.150.152.166/postgres?sslmode=disable",l=new r.Pool({connectionString:i,max:10,idleTimeoutMillis:3e4,connectionTimeoutMillis:5e3}),u=!1;async function o(){if(u)return;let e=await l.connect();try{await e.query("BEGIN"),await e.query(`
      CREATE TABLE IF NOT EXISTS trucks (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        driver_name VARCHAR(100),
        status VARCHAR(50) DEFAULT 'En Route',
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `),await e.query(`
      CREATE TABLE IF NOT EXISTS telemetry_history (
        id SERIAL PRIMARY KEY,
        truck_id VARCHAR(100) NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        speed DOUBLE PRECISION NOT NULL,
        data JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `),await e.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        type VARCHAR(50) NOT NULL,
        level VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `),await e.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        power_limit VARCHAR(50) DEFAULT '150kW',
        socket_status VARCHAR(50) DEFAULT 'Available',
        current_meter DOUBLE PRECISION DEFAULT 0.0,
        power_output DOUBLE PRECISION DEFAULT 0.0,
        schedule JSONB DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `),await e.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        truck_id VARCHAR(100) REFERENCES trucks(id) ON DELETE SET NULL,
        stations VARCHAR(100)[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);let t=await e.query("SELECT COUNT(*) FROM stations");if(0===parseInt(t.rows[0].count,10)){for(let t of(console.log("🌱 Seeding default charging stations into PostgreSQL..."),(0,s.getBaseStations)()))await e.query(`
          INSERT INTO stations (id, name, lat, lng, status, power_limit, socket_status, current_meter, power_output)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,[t.id,t.name,t.lat,t.lng,t.status,t.powerLimit,t.socketStatus,t.currentMeter,t.powerOutput]);console.log("🌱 Default charging stations seeded successfully!")}await e.query(`
      CREATE INDEX IF NOT EXISTS idx_telemetry_history_truck_ts ON telemetry_history(truck_id, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(timestamp DESC);
    `),await e.query("COMMIT"),u=!0,console.log("✅ PostgreSQL Database Initialized Successfully!")}catch(t){throw await e.query("ROLLBACK"),console.error("❌ Failed to initialize PostgreSQL Database:",t),t}finally{e.release()}}e.s(["initDb",()=>o,"pool",0,l,"query",0,(e,t)=>l.query(e,t)]),a()}catch(e){a(e)}},!1),99518,e=>e.a(async(t,a)=>{try{var r=e.i(62061),s=t([r]);[r]=s.then?(await s)():s,e.s(["logStore",0,{getLogs:async()=>{await (0,r.initDb)();try{let{rows:e}=await r.pool.query(`
        SELECT id, timestamp, type, level, message, metadata AS details 
        FROM logs 
        ORDER BY timestamp DESC 
        LIMIT 200
      `);return e.map(e=>({id:String(e.id),timestamp:new Date(e.timestamp).toISOString(),type:e.type,level:e.level,message:e.message,details:e.details}))}catch(e){return console.error("Failed to load logs from database:",e),[]}},addLog:async(e,t,a,s)=>{await (0,r.initDb)();try{await r.pool.query(`
        INSERT INTO logs (type, level, message, metadata) 
        VALUES ($1, $2, $3, $4)
      `,[e,t,a,s||{}]),await r.pool.query(`
        DELETE FROM logs 
        WHERE timestamp < NOW() - INTERVAL '90 days'
      `)}catch(e){console.error("Failed to add log to database:",e)}},clearLogs:async()=>{await (0,r.initDb)();try{await r.pool.query("TRUNCATE TABLE logs")}catch(e){console.error("Failed to clear logs in database:",e)}}}]),a()}catch(e){a(e)}},!1),37137,e=>e.a(async(t,a)=>{try{var r=e.i(23480),s=e.i(99518),n=t([s]);async function o(){try{let e=await s.logStore.getLogs();return r.NextResponse.json(e)}catch(e){return r.NextResponse.json({error:"Failed to fetch logs"},{status:500})}}async function i(){try{return await s.logStore.clearLogs(),await s.logStore.addLog("HTTP","WARN","Developer Console logs cleared by user"),r.NextResponse.json({success:!0})}catch(e){return r.NextResponse.json({error:"Failed to clear logs"},{status:500})}}[s]=n.then?(await n)():n,e.s(["DELETE",()=>i,"GET",()=>o]),a()}catch(e){a(e)}},!1),16965,e=>e.a(async(t,a)=>{try{var r=e.i(98490),s=e.i(18006),n=e.i(95912),o=e.i(72560),i=e.i(76852),l=e.i(38533),u=e.i(55822),d=e.i(54068),c=e.i(66843),p=e.i(99385),E=e.i(3050),T=e.i(75293),R=e.i(2144),A=e.i(33599),g=e.i(36497),m=e.i(93695);e.i(79178);var N=e.i(96717),L=e.i(37137),S=t([L]);[L]=S.then?(await S)():S;let I=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/logs/route",pathname:"/api/logs",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/web/src/app/api/logs/route.ts",nextConfigOutput:"standalone",userland:L}),{workAsyncStorage:w,workUnitAsyncStorage:C,serverHooks:y}=I;function O(){return(0,n.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:C})}async function h(e,t,a){I.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/logs/route";r=r.replace(/\/index$/,"")||"/";let n=await I.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:L,params:S,nextConfig:O,parsedUrl:h,isDraftMode:w,prerenderManifest:C,routerServerContext:y,isOnDemandRevalidate:M,revalidateOnlyGenerated:k,resolvedPathname:v,clientReferenceManifest:U,serverActionsManifest:x}=n,D=(0,u.normalizeAppPath)(r),b=!!(C.dynamicRoutes[D]||C.routes[v]),f=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,h,!1):t.end("This page could not be found"),null);if(b&&!w){let e=!!C.routes[v],t=C.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(O.experimental.adapterPath)return await f();throw new m.NoFallbackError}}let P=null;!b||I.isDev||w||(P=v,P="/index"===P?"/":P);let _=!0===I.isDev||!b,F=b&&!_;x&&U&&(0,l.setManifestsSingleton)({page:r,clientReferenceManifest:U,serverActionsManifest:x});let H=e.method||"GET",q=(0,i.getTracer)(),B=q.getActiveScopeSpan(),j={params:S,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!O.experimental.authInterrupts},cacheComponents:!!O.cacheComponents,supportsDynamicResponse:_,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:O.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>I.onRequestError(e,t,r,s,y)},sharedContext:{buildId:L}},W=new d.NodeNextRequest(e),$=new d.NodeNextResponse(t),V=c.NextRequestAdapter.fromNodeNextRequest(W,(0,c.signalFromNodeResponse)(t));try{let n=async e=>I.handle(V,j).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${H} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${H} ${r}`)}),l=!!(0,o.getRequestMeta)(e,"minimalMode"),u=async o=>{var i,u;let d=async({previousCacheEntry:s})=>{try{if(!l&&M&&k&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await n(o);e.fetchMetrics=j.renderOpts.fetchMetrics;let i=j.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let u=j.renderOpts.collectedTags;if(!b)return await (0,T.sendResponse)(W,$,r,j.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(r.headers);u&&(t[g.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,s=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:j.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:M})},!1,y),t}},c=await I.handleResponse({req:e,nextConfig:O,cacheKey:P,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:M,revalidateOnlyGenerated:k,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:l});if(!b)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(u=c.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",M?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),w&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,R.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&b||p.delete(g.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,A.getCacheControlHeader)(c.cacheControl)),await (0,T.sendResponse)(W,$,new Response(c.value.body,{headers:p,status:c.value.status||200})),null};B?await u(B):await q.withPropagatedContext(e.headers,()=>q.trace(p.BaseServerSpan.handleRequest,{spanName:`${H} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},u))}catch(t){if(t instanceof m.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:M})},!1,y),b)throw t;return await (0,T.sendResponse)(W,$,new Response(null,{status:500})),null}}e.s(["handler",()=>h,"patchFetch",()=>O,"routeModule",()=>I,"serverHooks",()=>y,"workAsyncStorage",()=>w,"workUnitAsyncStorage",()=>C]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__fd1a7c9f._.js.map