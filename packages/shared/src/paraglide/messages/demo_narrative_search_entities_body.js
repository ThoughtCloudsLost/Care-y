/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Entities_BodyInputs */

const en_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One query runs against cases, knowledge base articles and, for a user holding the Manage users permission, other users. While a case is open the query also runs against that case's conversation. [[#client-data #permissions #search]]
**What does a case match on?** The title, the client's alias, the queue the case sits in and the name of whoever holds it, all decrypted in the browser before the match runs. A deeper pass adds the text of the messages and notes on the case. Queue and assignee names are decrypted once each rather than once per case, so widening the match to those fields costs no extra decryption. [[#encryption #client-data]]
**What does an article match on?** The title and the excerpt already loaded for the library. A deeper pass adds the full body. [[#client-data]]
**What does an account match on?** The display name, decrypted in the browser. This group is present only for a user holding the Manage users permission, so the same query returns a group for one user and no group for another. [The permission system](#deep-dive/the-permission-system) covers that grant. [[#permissions #privacy]]
**What does the open case add?** Its messages and notes become a fourth group, matched against the text already decrypted for the thread. [In thread search](#ticket-detail/deep-search) covers what that search reaches and what it skips. [[#client-data]]
**What does matching tolerate, and what can it not reach?** A query typed without accents finds the accented original, and a small mistyping in a word still matches. [Searching this page](#tickets/page-search) covers the exact tolerance. A case whose title has not decrypted is skipped until it has. A case the user holds no key for cannot match on its title or its client's alias, but can still match on its queue or assignee name because those are decrypted from the organization key. [[#failure-states #keys]]
**The provider modules and the shared matcher.** Each kind is a module under \`packages/client/src/lib/search/providers/\`, registered into the shared registry as the surface that owns it mounts, which is why the set of groups changes with the surface. The matcher shared by all of them is \`fuzzy.ts\` over \`normalize.ts\` in \`packages/client/src/lib/search/\`. [[#client-data]]`)
};

const es_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una consulta recorre los tickets, los artículos de la base de conocimiento y, para quien tenga el permiso Gestionar usuarios, las demás personas. Mientras un ticket está abierto, la consulta también recorre la conversación de ese ticket. [[#client-data #permissions #search]]
**¿Con qué coincide un ticket?** El título, el alias del cliente, la cola en la que se encuentra y el nombre de quien lo tiene asignado, todo descifrado en el navegador antes de ejecutar la comparación. Una pasada más profunda añade el texto de los mensajes y las notas del ticket. Los nombres de cola y de persona asignada se descifran una vez cada uno en lugar de una vez por ticket, así que ampliar la comparación a esos campos no añade descifrado adicional. [[#encryption #client-data]]
**¿Con qué coincide un artículo?** El título y el extracto ya cargado para la biblioteca. Una pasada más profunda añade el cuerpo completo. [[#client-data]]
**¿Con qué coincide una cuenta?** El nombre visible, descifrado en el navegador. Este grupo solo está presente para quien tenga el permiso Gestionar usuarios, así que la misma consulta devuelve un grupo para una persona y ninguno para otra. [El sistema de permisos](#deep-dive/the-permission-system) trata esa concesión. [[#permissions #privacy]]
**¿Qué añade el ticket abierto?** Sus mensajes y notas se convierten en un cuarto grupo, comparados con el texto ya descifrado para el hilo. [Búsqueda en el hilo](#ticket-detail/deep-search) trata lo que esa búsqueda alcanza y lo que omite. [[#client-data]]
**¿Qué tolera la comparación y qué no puede alcanzar?** Una consulta escrita sin acentos encuentra el original acentuado, y un pequeño error de escritura en una palabra sigue coincidiendo. [Buscar en esta página](#tickets/page-search) trata la tolerancia exacta. Un ticket cuyo título no se ha descifrado queda fuera hasta que lo haga. Un ticket para el que la persona usuaria no tiene clave no puede coincidir por su título ni por el alias de su cliente, pero sí puede coincidir por el nombre de su cola o de su persona asignada, porque esos se descifran con la clave de la organización. [[#failure-states #keys]]
**Los módulos de proveedor y el comparador compartido.** Cada tipo es un módulo en \`packages/client/src/lib/search/providers/\`, registrado en el registro compartido cuando la superficie que lo posee se monta, y por eso el conjunto de grupos cambia con la superficie. El comparador compartido por todos es \`fuzzy.ts\` sobre \`normalize.ts\` en \`packages/client/src/lib/search/\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònè qùèry rùns àgàìnst càsès, knòwlèdgè bàsè àrtìclès ànd, fòr à ùsèr hòldìng thè Mànàgè ùsèrs pèrmìssìòn, òthèr ùsèrs. Whìlè à càsè ìs òpèn thè qùèry àlsò rùns àgàìnst thàt càsè's cònvèrsàtìòn. [[#clìènt-dàtà #pèrmìssìòns #sèàrch]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à càsè màtch òn? ••••••••** Thè tìtlè, thè clìènt's àlìàs, thè qùèùè thè càsè sìts ìn ànd thè nàmè òf whòèvèr hòlds ìt, àll dècryptèd ìn thè bròwsèr bèfòrè thè màtch rùns. À dèèpèr pàss àdds thè tèxt òf thè mèssàgès ànd nòtès òn thè càsè. Qùèùè ànd àssìgnèè nàmès àrè dècryptèd òncè èàch ràthèr thàn òncè pèr càsè, sò wìdènìng thè màtch tò thòsè fìèlds còsts nò èxtrà dècryptìòn. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès àn àrtìclè màtch òn? •••••••••** Thè tìtlè ànd thè èxcèrpt àlrèàdy lòàdèd fòr thè lìbràry. À dèèpèr pàss àdds thè fùll bòdy. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••**Whàt dòès àn àccòùnt màtch òn? •••••••••** Thè dìsplày nàmè, dècryptèd ìn thè bròwsèr. Thìs gròùp ìs prèsènt ònly fòr à ùsèr hòldìng thè Mànàgè ùsèrs pèrmìssìòn, sò thè sàmè qùèry rètùrns à gròùp fòr ònè ùsèr ànd nò gròùp fòr ànòthèr. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs thàt grànt. [[#pèrmìssìòns #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè òpèn càsè àdd? •••••••••** Ìts mèssàgès ànd nòtès bècòmè à fòùrth gròùp, màtchèd àgàìnst thè tèxt àlrèàdy dècryptèd fòr thè thrèàd. [Ìn thrèàd sèàrch](#tìckèt-dètàìl/dèèp-sèàrch) còvèrs whàt thàt sèàrch rèàchès ànd whàt ìt skìps. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès màtchìng tòlèràtè, ànd whàt càn ìt nòt rèàch? •••••••••••••••••** À qùèry typèd wìthòùt àccènts fìnds thè àccèntèd òrìgìnàl, ànd à smàll mìstypìng ìn à wòrd stìll màtchès. [Sèàrchìng thìs pàgè](#tìckèts/pàgè-sèàrch) còvèrs thè èxàct tòlèràncè. À càsè whòsè tìtlè hàs nòt dècryptèd ìs skìppèd ùntìl ìt hàs. À càsè thè ùsèr hòlds nò kèy fòr cànnòt màtch òn ìts tìtlè òr ìts clìènt's àlìàs, bùt càn stìll màtch òn ìts qùèùè òr àssìgnèè nàmè bècàùsè thòsè àrè dècryptèd fròm thè òrgànìzàtìòn kèy. [[#fàìlùrè-stàtès #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè pròvìdèr mòdùlès ànd thè shàrèd màtchèr. ••••••••••••••** Èàch kìnd ìs à mòdùlè ùndèr \`pàckàgès/clìènt/src/lìb/sèàrch/pròvìdèrs/\`, règìstèrèd ìntò thè shàrèd règìstry às thè sùrfàcè thàt òwns ìt mòùnts, whìch ìs why thè sèt òf gròùps chàngès wìth thè sùrfàcè. Thè màtchèr shàrèd by àll òf thèm ìs \`fùzzy.ts\` òvèr \`nòrmàlìzè.ts\` ìn \`pàckàgès/clìènt/src/lìb/sèàrch/\`. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "One query runs against cases, knowledge base articles and, for a user holding the Manage users permission, other users. While a case is open the query also r..." |
*
* @param {Demo_Narrative_Search_Entities_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_entities_body = /** @type {((inputs?: Demo_Narrative_Search_Entities_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Entities_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_entities_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_search_entities_body(inputs)
	return en_demo_narrative_search_entities_body(inputs)
});