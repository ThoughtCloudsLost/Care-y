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
	return /** @type {LocalizedString} */ (`⟦À blòckèd nùmbèr rèàchès nòthìng, sìncè à càll fròm ìt ìs rèjèctèd ànd à tèxt fròm ìt ìs dròppèd, bòth bèfòrè à clìènt rècòrd òr à tìckèt ìs tòùchèd. Blòckìng ànd ùnblòckìng nèèd pèrmìssìòn tò mànàgè ìnfràstrùctùrè. [[#tèlèphòny #pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw à nùmbèr ìs màtchèd wìthòùt bèìng stòrèd. ••••••••••••••** Èàch èntry kèèps twò thìngs, à kèyèd hàsh òf thè nùmbèr thàt thè sèrvèr còmpàrès àgàìnst àn ìncòmìng càll, ànd thè nùmbèr ìtsèlf sèàlèd tò thè òrgànìzàtìòn's pùblìc kèy sò thè bròwsèr càn shòw thè lìst bàck. Thè hàsh ìs whàt thè màtch rùns òn, sò thè sèrvèr càn tèll thàt à càllèr ìs blòckèd wìthòùt bèìng àblè tò rèàd whò. [[#èncryptìòn #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè hònèst lìmìt òf thè hàsh. •••••••••** Thè kèy bèhìnd thè hàsh ìs thè sèrvèr's òpèràtìònàl kèy ràthèr thàn àn òrgànìzàtìòn kèy, sò à sèrvèr thàt ìs rùnnìng càn tèst àny nùmbèr ìt lìkès àgàìnst thè lìst; whàt thè hàsh pròtècts ìs à stòlèn dàtàbàsè, whèrè thè èntrìès àrè ùnrèàdàblè wìthòùt thàt kèy. Phònè nùmbèrs àrè à smàll ènòùgh spàcè thàt thè kèy ìs thè whòlè pròtèctìòn, nòt thè hàshìng. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè kèy tìèrs. [[#kèys #trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt blòckìng rècòrds ànd whàt ìt dòès nòt ùndò. •••••••••••••••** Thè ròw càrrìès thè hàsh, thè sèàlèd nùmbèr, thè àccòùnt thàt àddèd ìt ànd thè tìmè, sò à dàtàbàsè dùmp shòws hòw màny nùmbèrs àn òrgànìzàtìòn hàs blòckèd ànd whèn, ànd nònè òf thè nùmbèrs. Blòckìng ìs àbòùt fùtùrè còntàct, sò à tìckèt àlrèàdy òpèn wìth à blòckèd nùmbèr kèèps ìts hìstòry ànd thè nùmbèr càn stìll bè càllèd fròm ìt. [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè chèck ànd ìts pòsìtìòn ìn thè hàndlèr. •••••••••••••** \`crèàtèBlòcklìstRèpòsìtòry\` ìn \`pàckàgès/sèrvèr/src/tèlèphòny/mòdèls/blòcklìst-rèpò.ts\` ànswèrs thè mèmbèrshìp tèst òn àn ìndèxèd hàsh còlùmn, ànd bòth ìnbòùnd hàndlèrs càll ìt bèfòrè àny òthèr wòrk, à càll ànswèrèd wìth à bùsy rèjèctìòn ànd à tèxt wìth nòthìng àt àll, sò à blòckèd sèndèr lèàrns nòthìng fròm thè dìffèrèncè. À mèrgè-càndìdàtè scàn trèàts blòckèd nùmbèrs às ìt trèàts àny òthèr. [Mèrgìng clìènts](#àdmìn-pèòplè/clìènt-mèrgè) còvèrs thàt scàn. [[#fàìlùrè-stàtès]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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