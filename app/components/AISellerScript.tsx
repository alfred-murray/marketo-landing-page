"use client";

import Script from "next/script";

declare global {
  interface Window {
    AISeller?: ((action: string, settings?: Record<string, unknown>) => void) & {
      q?: IArguments[];
    };
    AISellerSettings?: {
      agent_id: string;
      [key: string]: unknown;
    };
  }
}

const DEFAULT_AGENT_ID = "e4e2cc8e-4d25-4443-a4a1-05dbd5fc7298";
const AGENT_ID_QUERY_PARAM = "agent_id";

export function AISellerScript() {
  return (
    <Script id="ai-seller-loader" strategy="afterInteractive">
      {`
        (function () {
          var w = window;
          var params = new URLSearchParams(w.location.search);
          var agentId = params.get('${AGENT_ID_QUERY_PARAM}') || '${DEFAULT_AGENT_ID}';
          w.AISellerSettings = { agent_id: agentId };
        })();
        (function () {
          var w = window;
          var ew = w.AISeller;
          if (typeof ew === 'function') {
            ew('update', w.AISellerSettings);
          } else {
            var d = document;
            var i = function () { i.q.push(arguments); };
            i.q = [];
            i.q.push(['update', w.AISellerSettings]);
            w.AISeller = i;
            var l = function () {
              var s = d.createElement('script');
              s.type = 'text/javascript';
              s.async = true;
              s.src = 'https://d33t2173eag6fx.cloudfront.net/script/sandbox-marketo-integration-v0/inbound-se-script/ai-seller.js';
              var x = d.getElementsByTagName('script')[0];
              x.parentNode.insertBefore(s, x);
            };
            if (document.readyState === 'complete') {
              l();
            } else if (w.attachEvent) {
              w.attachEvent('onload', l);
            } else {
              w.addEventListener('load', l, false);
            }
          }
        })();
      `}
    </Script>
  );
}
