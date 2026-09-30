/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Blocklist_BodyInputs */

const en_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The blocklist prevents a phone number from reaching the organization. An inbound call from a blocked number receives a busy signal, and an inbound text is dropped with no reply. Both checks run before any client record or ticket exists for that contact. Adding or removing a number requires the Manage infrastructure permission. [[#telephony #permissions]]
**What does each entry store?** Each entry stores a keyed hash of the number and the number sealed to the organization's public key. The server matches incoming numbers against the hash. The browser decrypts the sealed copy with the organization key to show the list. [[#encryption #privacy]]
**What does the hash protect?** The hash key is the server's operational key. A running server can test any number against the list, because it holds that key. A dump taken without the key gives no readable numbers. The total phone number space is small enough that the key alone is the protection, not the hashing. [How encryption works](#deep-dive/how-encryption-works) covers the key tiers. [[#keys #trust-boundary]]
**What does a database dump reveal?** Each row holds the hash, the sealed number, the adding account, and a timestamp. A dump reveals the count of blocked numbers and the dates, but none of the numbers themselves. Blocking applies to future contact only. An existing ticket whose client has a blocked number keeps its full history, and the user can still place outbound calls to that number from the ticket. [[#server-holds #metadata]]
**The membership test and the inbound handlers.** \`createBlocklistRepository\` in \`packages/server/src/telephony/models/blocklist-repo.ts\` runs the hash comparison on an indexed column. Both inbound handlers query it before doing any other work. A blocked call gets a busy rejection and a blocked text gets no response, so the blocked sender cannot distinguish the two outcomes. The merge-candidate scan does not exclude blocked numbers. [Merging clients](#admin-people/client-merge) covers that scan. [[#failure-states]]`)
};

const es_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de bloqueo impide que un número de teléfono llegue a la organización. Una llamada entrante de un número bloqueado recibe señal de ocupado, y un mensaje entrante se descarta sin respuesta. Ambas comprobaciones se ejecutan antes de que exista un registro de cliente o un ticket para ese contacto. Añadir o eliminar un número requiere el permiso Gestionar infraestructura. [[#telephony #permissions]]
**¿Qué guarda cada entrada?** Cada entrada guarda un hash con clave del número y el número sellado con la clave pública de la organización. El servidor compara los números entrantes con el hash. El navegador descifra la copia sellada con la clave de la organización para mostrar la lista. [[#encryption #privacy]]
**¿Qué protege el hash?** La clave del hash es la clave operativa del servidor. Un servidor en marcha puede probar cualquier número contra la lista, porque tiene esa clave. Un volcado tomado sin la clave no da números legibles. El espacio total de números de teléfono es lo bastante pequeño como para que la protección sea la clave sola, no el hasheo. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los niveles de claves. [[#keys #trust-boundary]]
**¿Qué revela un volcado de la base de datos?** Cada fila contiene el hash, el número sellado, la cuenta que lo añadió y una marca de tiempo. Un volcado revela la cantidad de números bloqueados y las fechas, pero ninguno de los números en sí. El bloqueo se aplica solo al contacto futuro. Un ticket existente cuyo cliente tiene un número bloqueado conserva su historial completo, y la persona usuaria puede seguir haciendo llamadas salientes a ese número desde el ticket. [[#server-holds #metadata]]
**La prueba de pertenencia y los manejadores de entrada.** \`createBlocklistRepository\`, en \`packages/server/src/telephony/models/blocklist-repo.ts\`, ejecuta la comparación del hash sobre una columna indexada. Ambos manejadores de entrada lo consultan antes de hacer cualquier otro trabajo. Una llamada bloqueada recibe un rechazo de ocupado y un mensaje bloqueado no recibe respuesta, de modo que el remitente bloqueado no puede distinguir los dos resultados. El análisis de candidatos a fusión no excluye los números bloqueados. [Fusionar clientes](#admin-people/client-merge) trata ese análisis. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè blòcklìst prèvènts à phònè nùmbèr fròm rèàchìng thè òrgànìzàtìòn. Àn ìnbòùnd càll fròm à blòckèd nùmbèr rècèìvès à bùsy sìgnàl, ànd àn ìnbòùnd tèxt ìs dròppèd wìth nò rèply. Bòth chècks rùn bèfòrè àny clìènt rècòrd òr tìckèt èxìsts fòr thàt còntàct. Àddìng òr rèmòvìng à nùmbèr rèqùìrès thè Mànàgè ìnfràstrùctùrè pèrmìssìòn. [[#tèlèphòny #pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès èàch èntry stòrè? •••••••••** Èàch èntry stòrès à kèyèd hàsh òf thè nùmbèr ànd thè nùmbèr sèàlèd tò thè òrgànìzàtìòn's pùblìc kèy. Thè sèrvèr màtchès ìncòmìng nùmbèrs àgàìnst thè hàsh. Thè bròwsèr dècrypts thè sèàlèd còpy wìth thè òrgànìzàtìòn kèy tò shòw thè lìst. [[#èncryptìòn #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè hàsh pròtèct? •••••••••** Thè hàsh kèy ìs thè sèrvèr's òpèràtìònàl kèy. À rùnnìng sèrvèr càn tèst àny nùmbèr àgàìnst thè lìst, bècàùsè ìt hòlds thàt kèy. À dùmp tàkèn wìthòùt thè kèy gìvès nò rèàdàblè nùmbèrs. Thè tòtàl phònè nùmbèr spàcè ìs smàll ènòùgh thàt thè kèy àlònè ìs thè pròtèctìòn, nòt thè hàshìng. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè kèy tìèrs. [[#kèys #trùst-bòùndàry]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à dàtàbàsè dùmp rèvèàl? ••••••••••** Èàch ròw hòlds thè hàsh, thè sèàlèd nùmbèr, thè àddìng àccòùnt, ànd à tìmèstàmp. À dùmp rèvèàls thè còùnt òf blòckèd nùmbèrs ànd thè dàtès, bùt nònè òf thè nùmbèrs thèmsèlvès. Blòckìng àpplìès tò fùtùrè còntàct ònly. Àn èxìstìng tìckèt whòsè clìènt hàs à blòckèd nùmbèr kèèps ìts fùll hìstòry, ànd thè ùsèr càn stìll plàcè òùtbòùnd càlls tò thàt nùmbèr fròm thè tìckèt. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè mèmbèrshìp tèst ànd thè ìnbòùnd hàndlèrs. ••••••••••••••** \`crèàtèBlòcklìstRèpòsìtòry\` ìn \`pàckàgès/sèrvèr/src/tèlèphòny/mòdèls/blòcklìst-rèpò.ts\` rùns thè hàsh còmpàrìsòn òn àn ìndèxèd còlùmn. Bòth ìnbòùnd hàndlèrs qùèry ìt bèfòrè dòìng àny òthèr wòrk. À blòckèd càll gèts à bùsy rèjèctìòn ànd à blòckèd tèxt gèts nò rèspònsè, sò thè blòckèd sèndèr cànnòt dìstìngùìsh thè twò òùtcòmès. Thè mèrgè-càndìdàtè scàn dòès nòt èxclùdè blòckèd nùmbèrs. [Mèrgìng clìènts](#àdmìn-pèòplè/clìènt-mèrgè) còvèrs thàt scàn. [[#fàìlùrè-stàtès]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The blocklist prevents a phone number from reaching the organization. An inbound call from a blocked number receives a busy signal, and an inbound text is dr..." |
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