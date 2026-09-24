/* eslint-disable */
import * as registry from '../registry.js'
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Overlay_BodyInputs */

const en_demo_narrative_search_overlay_body = /** @type {(inputs: Demo_Narrative_Search_Overlay_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Global search opens over whatever the user is doing and answers from two lists before a word is typed: the searches made this session and the cases and articles opened recently. Matching starts at two characters. [[#privacy #client-data #search]]
**What the recent searches are.** Ten terms at most, held in memory for the length of the session and gone at sign-out or reload. No search term is written to the device or sent anywhere, so a browser handed to someone else carries no record of what was looked for. [[#privacy #client-data]]
**What the recently viewed list is made of.** One envelope on the server, sealed to the user's own public key and opened only in that user's browser, holding the identifiers of up to twenty recent cases and articles with the times they were opened and none of their titles. The server stores the bytes and cannot read which case an identifier points at, and no other account can open the envelope at all. [How encryption works](#deep-dive/how-encryption-works) covers the key it is sealed to. [[#encryption #server-holds]]
**Why an entry can fall out of that list.** The identifiers are resolved through the same searches the overlay runs, so an entry the account no longer has access to fails to resolve and is not shown. A password change replaces the keys the envelope was sealed to and makes it unopenable, which is read as an empty history and overwritten by the next entry rather than reported as a failure. [Password and key re-wrap](#settings/password) covers that rotation. [[#failure-states #keys]]
**How results arrive.** Results are grouped by the kind of record they are, and the group matching the surface the search was opened from is placed first, so the same query answers differently from the case list than from the library. Each group reports how many of its records were searched against the total, which is what makes a partial answer legible as partial. [What global search covers](#search/entities) covers the kinds. [[#client-data #metadata]]
**The overlay and its lists.** The provider registry is \`packages/client/src/lib/search/registry.svelte.ts\`, the session term list is \`recents.svelte.ts\`, and the recently viewed envelope is \`recent-views.ts\` against \`user_recent_views\` from \`packages/server/src/db/migrations/tenant/079_create_user_recent_views.ts\`, which is one row per account with no timestamp column of its own. [[#server-holds #client-data]]`)
};

const es_demo_narrative_search_overlay_body = /** @type {(inputs: Demo_Narrative_Search_Overlay_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La búsqueda global se abre sobre lo que la persona usuaria esté haciendo y responde con dos listas antes de teclear nada: las búsquedas hechas en esta sesión y los casos y artículos abiertos hace poco. La coincidencia empieza a los dos caracteres. [[#privacy #client-data #search]]
**Qué son las búsquedas recientes.** Diez términos como mucho, guardados en memoria mientras dura la sesión y desaparecidos al cerrar sesión o recargar. Ningún término de búsqueda se escribe en el dispositivo ni se envía a ninguna parte, así que un navegador prestado a otra persona no lleva constancia de qué se buscó. [[#privacy #client-data]]
**De qué está hecha la lista de vistos recientemente.** De un único sobre en el servidor, sellado con la clave pública de la propia persona usuaria y abierto solo en su navegador, que contiene los identificadores de hasta veinte casos y artículos recientes con la hora en que se abrieron y ninguno de sus títulos. El servidor guarda los bytes y no puede leer a qué caso apunta un identificador, y ninguna otra cuenta puede abrir el sobre. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave con la que se sella. [[#encryption #server-holds]]
**Por qué una entrada puede salirse de esa lista.** Los identificadores se resuelven mediante las mismas búsquedas que ejecuta la ventana, así que una entrada a la que la cuenta ya no tiene acceso no se resuelve y no se muestra. Un cambio de contraseña sustituye las claves con las que se selló el sobre y lo deja sin poder abrirse, lo que se interpreta como un historial vacío y se sobrescribe con la entrada siguiente en lugar de informar de un fallo. [Contraseña y reenvoltura de claves](#settings/password) trata esa rotación. [[#failure-states #keys]]
**Cómo llegan los resultados.** Los resultados se agrupan por la clase de registro que son, y el grupo que corresponde a la superficie desde la que se abrió la búsqueda se coloca primero, de modo que la misma consulta responde de otra manera desde la lista de casos que desde la biblioteca. Cada grupo indica cuántos de sus registros se examinaron sobre el total, que es lo que hace legible una respuesta parcial como parcial. [Qué cubre la búsqueda global](#search/entities) trata las clases. [[#client-data #metadata]]
**La ventana y sus listas.** El registro de proveedores es \`packages/client/src/lib/search/registry.svelte.ts\`, la lista de términos de la sesión es \`recents.svelte.ts\`, y el sobre de vistos recientemente es \`recent-views.ts\` contra \`user_recent_views\`, de \`packages/server/src/db/migrations/tenant/079_create_user_recent_views.ts\`, que es una fila por cuenta y sin columna propia de fecha. [[#server-holds #client-data]]`)
};

const en_xa2_demo_narrative_search_overlay_body = /** @type {(inputs: Demo_Narrative_Search_Overlay_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèàrch shèèt shòws rècènt sèàrchès ànd strìps òf rècèntly vìèwèd tìckèts ànd àrtìclès.
 ••••••••••••••••••••••••••••**Rèsùlt gròùps. •••••** Rèsùlts gròùp by typè, ànd thè gròùp màtchìng thè cùrrènt pàgè sòrts fìrst, sò sèàrchìng fròm thè tìckèt lìst pùts tìckèt rèsùlts òn tòp. Èàch gròùp shòws hòw màny màtchès wèrè fòùnd. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Global search opens over whatever the user is doing and answers from two lists before a word is typed: the searches made this session and the cases and artic..." |
*
* @param {Demo_Narrative_Search_Overlay_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_body = /** @type {((inputs?: Demo_Narrative_Search_Overlay_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Overlay_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_overlay_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_search_overlay_body(inputs)
	return en_demo_narrative_search_overlay_body(inputs)
});