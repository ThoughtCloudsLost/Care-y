/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Entities_BodyInputs */

const en_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One query runs against cases, knowledge base articles and, for an account permitted to manage people, other accounts. While a case is open it also runs against that case's own entries. [[#client-data #permissions #search]]
**What a case is matched on.** Its title, the client's alias, the queue it sits in and the name of whoever holds it, all of them decrypted in the browser before the match. A deeper pass adds the text of the entries on the case. Queue and assignee names are decrypted once each rather than once per case, so widening the match this far costs no extra decryption. [[#encryption #client-data]]
**What an article is matched on.** Its title and the excerpt already loaded for the library, with the full body added by a deeper pass. [[#client-data]]
**What an account is matched on.** Its display name, decrypted in the browser like any other. This group is present only for an account holding the permission to manage people, so the same query returns a group for one colleague and no such group for another. [The permission system](#deep-dive/the-permission-system) covers that grant. [[#permissions #privacy]]
**What the open case adds.** With a case open, its entries become a fourth group, matched against the text already decrypted for the thread. [Searching a case](#ticket-detail/deep-search) covers what that search reaches and what it skips. [[#client-data]]
**What matching tolerates and what it cannot see.** Accents are folded and a single typo per word is forgiven, so a query typed without accents finds the accented word. A record whose text has not decrypted is skipped rather than guessed at, which means a case the account holds no key for never matches on anything but the plaintext around it. [[#failure-states #keys]]
**The providers.** Each kind is a provider under \`packages/client/src/lib/search/providers/\`, registered into the shared registry as the surface that owns it mounts, which is why the set of groups changes with the surface. The matcher shared by all of them is \`fuzzy.ts\` over \`normalize.ts\` in \`packages/client/src/lib/search/\`. [[#client-data]]`)
};

const es_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una misma consulta se ejecuta sobre los casos, los artículos de la base de conocimiento y, para una cuenta con permiso para gestionar personas, las demás cuentas. Con un caso abierto se ejecuta además sobre las entradas de ese caso. [[#client-data #permissions #search]]
**Con qué se compara un caso.** Con su título, el alias del cliente, la cola en la que está y el nombre de quien lo lleva, todos descifrados en el navegador antes de la comparación. Una pasada más profunda añade el texto de las entradas del caso. Los nombres de cola y de persona asignada se descifran una vez cada uno y no una vez por caso, de modo que ampliar así la comparación no cuesta descifrado adicional. [[#encryption #client-data]]
**Con qué se compara un artículo.** Con su título y el extracto ya cargado para la biblioteca, y una pasada más profunda añade el cuerpo completo. [[#client-data]]
**Con qué se compara una cuenta.** Con su nombre visible, descifrado en el navegador como cualquier otro. Ese grupo solo aparece para una cuenta con el permiso de gestionar personas, así que la misma consulta devuelve un grupo para una compañera y ningún grupo así para otra. [El sistema de permisos](#deep-dive/the-permission-system) trata esa concesión. [[#permissions #privacy]]
**Lo que añade el caso abierto.** Con un caso abierto, sus entradas forman un cuarto grupo, comparado con el texto ya descifrado para la conversación. [Buscar dentro de un caso](#ticket-detail/deep-search) trata hasta dónde llega esa búsqueda y qué deja fuera. [[#client-data]]
**Qué tolera la comparación y qué no puede ver.** Los acentos se ignoran y se perdona una errata por palabra, de modo que una consulta escrita sin acentos encuentra la palabra acentuada. Un registro cuyo texto no se ha descifrado se omite en lugar de adivinarse, lo que significa que un caso del que la cuenta no tiene la clave nunca coincide por nada que no sean sus campos en claro. [[#failure-states #keys]]
**Los proveedores.** Cada clase es un proveedor de \`packages/client/src/lib/search/providers/\`, registrado en el registro compartido cuando se monta la superficie que lo gobierna, que es por lo que el conjunto de grupos cambia con la superficie. El comparador que todos comparten es \`fuzzy.ts\` sobre \`normalize.ts\`, en \`packages/client/src/lib/search/\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦**Tìckèts. •••** Màtchès òn dècryptèd tìtlè, clìènt àlìàs, qùèùè nàmè, ànd àssìgnèè nàmè. Fùll dèèp sèàrch àlsò màtchès òn mèssàgè còntènt wìthìn tìckèts.
 ••••••••••••••••••••••••••••••••••••••••••**Knòwlèdgè bàsè àrtìclès. ••••••••** Màtchès òn dècryptèd tìtlè ànd èxcèrpt. Fùll dèèp sèàrch àlsò màtchès òn fùll àrtìclè bòdy tèxt.
 ••••••••••••••••••••••••••••••**Vòlùntèèrs. ••••** Àvàìlàblè tò àdmìnìstràtòrs ànd mànàgèrs ònly. Màtchès òn dècryptèd dìsplày nàmès. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "One query runs against cases, knowledge base articles and, for an account permitted to manage people, other accounts. While a case is open it also runs again..." |
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