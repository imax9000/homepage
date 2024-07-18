---
tags: [atproto, bluesky]
---

# PSA: offering a domain for `at://` URI resolver

I've got my hand on a domain `atproto.link`, intending to make a client-side
[`at://` URI](https://atproto.com/specs/at-uri-scheme) resolver/redirector. <!--truncate--> Also
wanted to have it act as a [protocol
handler](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler),
but it seems that the closest thing possible is `web+at://`, since the whitelist
of allowed protocols is hardcoded.

If you're interested in making something similar and want to use this domain -
hit me up.
