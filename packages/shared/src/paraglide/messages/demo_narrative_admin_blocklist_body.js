/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Blocklist_BodyInputs */

const en_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A blocked number reaches nothing, since a call from it is rejected and a text from it is dropped, both before a client record or a ticket is touched. Blocking and unblocking need permission to manage infrastructure. [[#telephony #permissions]]
**How a number is matched without being stored.** Each entry keeps two things, a keyed hash of the number that the server compares against an incoming call, and the number itself sealed to the organization's public key so the browser can show the list back. The hash is what the match runs on, so the server can tell that a caller is blocked without being able to read who. [[#encryption #privacy]]
**The honest limit of the hash.** The key behind the hash is the server's operational key rather than an organization key, so a server that is running can test any number it likes against the list; what the hash protects is a stolen database, where the entries are unreadable without that key. Phone numbers are a small enough space that the key is the whole protection, not the hashing. [How encryption works](#deep-dive/how-encryption-works) covers the key tiers. [[#keys #trust-boundary]]
**What blocking records and what it does not undo.** The row carries the hash, the sealed number, the account that added it and the time, so a database dump shows how many numbers an organization has blocked and when, and none of the numbers. Blocking is about future contact, so a ticket already open with a blocked number keeps its history and the number can still be called from it. [[#server-holds #metadata]]
**The check and its position in the handler.** \`createBlocklistRepository\` in \`packages/server/src/telephony/models/blocklist-repo.ts\` answers the membership test on an indexed hash column, and both inbound handlers call it before any other work, a call answered with a busy rejection and a text with nothing at all, so a blocked sender learns nothing from the difference. A merge-candidate scan treats blocked numbers as it treats any other. [Merging clients](#admin-people/client-merge) covers that scan. [[#failure-states]]`)
};

const es_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un número bloqueado no llega a nada, porque una llamada suya se rechaza y un mensaje suyo se descarta, en ambos casos antes de tocar ningún registro de cliente ni ningún ticket. Bloquear y desbloquear requieren permiso para gestionar la infraestructura. [[#telephony #permissions]]
**Cómo se compara un número sin guardarlo.** Cada entrada conserva dos cosas, un hash con clave del número que el servidor compara con una llamada entrante y el número en sí sellado con la clave pública de la organización para que el navegador pueda mostrar la lista. La comparación se hace sobre el hash, así que el servidor puede saber que quien llama está bloqueado sin poder leer quién es. [[#encryption #privacy]]
**El límite honesto del hash.** La clave del hash es la clave operativa del servidor y no una clave de la organización, de modo que un servidor en marcha puede probar contra la lista cualquier número que quiera; lo que protege el hash es una base de datos robada, donde las entradas quedan ilegibles sin esa clave. Los números de teléfono son un espacio lo bastante pequeño como para que la protección sea la clave y no el hasheo. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) explica los niveles de claves. [[#keys #trust-boundary]]
**Lo que registra un bloqueo y lo que no deshace.** La fila lleva el hash, el número sellado, la cuenta que lo añadió y la fecha, así que un volcado de la base de datos muestra cuántos números ha bloqueado una organización y cuándo, y ninguno de los números. El bloqueo se refiere al contacto futuro, de modo que un ticket ya abierto con un número bloqueado conserva su historial y desde él se puede seguir llamando a ese número. [[#server-holds #metadata]]
**La comprobación y su lugar en el manejador.** \`createBlocklistRepository\`, en \`packages/server/src/telephony/models/blocklist-repo.ts\`, responde a la prueba de pertenencia sobre una columna de hash indexada, y los dos manejadores de entrada la llaman antes que cualquier otro trabajo, una llamada con un rechazo de ocupado y un mensaje sin nada en absoluto, así que quien envía desde un número bloqueado no aprende nada de esa diferencia. Un análisis de candidatos a fusión trata los números bloqueados como cualquier otro. [Fusionar clientes](#admin-people/client-merge) trata ese análisis. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè nùmbèrs càn bè blòckèd fròm rèàchìng thè òrgànìzàtìòn, ànd à blòckèd nùmbèr ìs rèjèctèd bèfòrè à tìckèt ìs crèàtèd.
 •••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Blòckèd nùmbèrs àrè èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè, sò thè sèrvèr stòrès cìphèrtèxt ìt cànnòt rèàd.
 •••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Mànàgìng thè blòcklìst rèqùìrès thè Mànàgè ìnfràstrùctùrè pèrmìssìòn. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A blocked number reaches nothing, since a call from it is rejected and a text from it is dropped, both before a client record or a ticket is touched. Blockin..." |
*
* @param {Demo_Narrative_Admin_Blocklist_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_blocklist_body = /** @type {((inputs?: Demo_Narrative_Admin_Blocklist_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Blocklist_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_blocklist_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_blocklist_body(inputs)
	return en_demo_narrative_admin_blocklist_body(inputs)
});