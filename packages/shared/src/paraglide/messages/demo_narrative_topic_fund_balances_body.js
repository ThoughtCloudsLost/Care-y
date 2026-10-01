/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Fund_Balances_BodyInputs */

const en_demo_narrative_topic_fund_balances_body = /** @type {(inputs: Demo_Narrative_Topic_Fund_Balances_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each queue can carry a fund, and when it does, the case panel shows the fund's name and available balance alongside the other case sections. The dashboard queue cards show the same balance below the ticket counts. All balances come from a single session cache over the fund list, and all fund surfaces read it. [[#client-data #encryption]]
**Where does the balance come from?** The browser fetches each fund's sealed running balance from the server, decrypts it with the organization key, and caches the result for the session. A balance updates after any write and after a fund entry recorded event arrives from another session. No surface reads the ledger to show a balance. [[#encryption #keys]]
**Queue fund mapping.** Each queue's fund reference is a sealed column on the queue row, encrypted with the organization key. The server stores the bytes and does not read them. An administrator sets the mapping in the queue editor, and cases in that queue inherit the fund. The disbursement sheet preselects it. [[#encryption #server-holds #metadata]]
**Negative balances.** A fund whose balance falls below zero shows the amount in muted, neutral styling. The system records the disbursement and warns once inside the sheet before saving, but it does not block the write. [[#failure-states]]
**Permission gating.** Viewing fund names and balances requires the View funds permission, which sits with Volunteer and above by default. Without it, the balance line, the queue card balance, and the disbursement action do not appear, and the server refuses the request. [The permission system](#deep-dive/the-permission-system) covers how permissions are granted. [[#permissions]]
**The session cache and its invalidation.** \`createFundStore\` in \`packages/client/src/lib/funds/fund-store.svelte.ts\` wraps \`funds.list\` in a TanStack Query cache keyed by \`fundKeys.all\`. Writes and the \`fund_entry_recorded\` SSE event invalidate the key. \`createCaseFund\` derives the queue's fund from the decrypted queue mapping and the fund list together, and the case panel reads this shared cache. [[#client-data]]`)
};

const es_demo_narrative_topic_fund_balances_body = /** @type {(inputs: Demo_Narrative_Topic_Fund_Balances_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada cola puede llevar un fondo, y cuando lo tiene, el panel del caso muestra el nombre del fondo y su saldo disponible junto a las demás secciones del caso. Las tarjetas de cola del panel principal muestran el mismo saldo debajo de los contadores de tickets. Todos los saldos provienen de una única caché de sesión sobre la lista de fondos, y todas las superficies de fondos la leen. [[#client-data #encryption]]
**¿De dónde viene el saldo?** El navegador obtiene el saldo sellado de cada fondo del servidor, lo descifra con la clave de la organización y guarda el resultado en caché durante la sesión. Un saldo se actualiza tras cualquier escritura y cuando llega un evento de entrada de fondo registrada desde otra sesión. Ninguna superficie lee el libro mayor para mostrar un saldo. [[#encryption #keys]]
**Asignación de fondo a cola.** La referencia al fondo de cada cola es una columna sellada en la fila de la cola, cifrada con la clave de la organización. El servidor almacena los bytes y no los lee. Una persona administradora configura la asignación en el editor de colas, y los casos de esa cola heredan el fondo. La hoja de desembolso lo preselecciona. [[#encryption #server-holds #metadata]]
**Saldos negativos.** Un fondo cuyo saldo cae por debajo de cero muestra la cantidad con estilo atenuado y neutro. El sistema registra el desembolso y avisa una vez dentro de la hoja antes de guardar, pero no bloquea la escritura. [[#failure-states]]
**Control de permisos.** Ver los nombres y saldos de los fondos requiere el permiso Ver fondos, que corresponde a Voluntario y superiores de forma predeterminada. Sin él, la línea de saldo, el saldo en la tarjeta de cola y la acción de desembolso no aparecen, y el servidor rechaza la solicitud. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo se otorgan los permisos. [[#permissions]]
**La caché de sesión y su invalidación.** \`createFundStore\` en \`packages/client/src/lib/funds/fund-store.svelte.ts\` envuelve \`funds.list\` en una caché de TanStack Query con la clave \`fundKeys.all\`. Las escrituras y el evento SSE \`fund_entry_recorded\` invalidan esa clave. \`createCaseFund\` deriva el fondo de la cola a partir de la asignación descifrada y la lista de fondos juntas, y el panel del caso lee esa caché compartida. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_fund_balances_body = /** @type {(inputs: Demo_Narrative_Topic_Fund_Balances_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch qùèùè càn càrry à fùnd, ànd whèn ìt dòès, thè càsè pànèl shòws thè fùnd's nàmè ànd àvàìlàblè bàlàncè àlòngsìdè thè òthèr càsè sèctìòns. Thè dàshbòàrd qùèùè càrds shòw thè sàmè bàlàncè bèlòw thè tìckèt còùnts. Àll bàlàncès còmè fròm à sìnglè sèssìòn càchè òvèr thè fùnd lìst, ànd àll fùnd sùrfàcès rèàd ìt. [[#clìènt-dàtà #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè dòès thè bàlàncè còmè fròm? ••••••••••** Thè bròwsèr fètchès èàch fùnd's sèàlèd rùnnìng bàlàncè fròm thè sèrvèr, dècrypts ìt wìth thè òrgànìzàtìòn kèy, ànd càchès thè rèsùlt fòr thè sèssìòn. À bàlàncè ùpdàtès àftèr àny wrìtè ànd àftèr à fùnd èntry rècòrdèd èvènt àrrìvès fròm ànòthèr sèssìòn. Nò sùrfàcè rèàds thè lèdgèr tò shòw à bàlàncè. [[#èncryptìòn #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèùè fùnd màppìng. ••••••** Èàch qùèùè's fùnd rèfèrèncè ìs à sèàlèd còlùmn òn thè qùèùè ròw, èncryptèd wìth thè òrgànìzàtìòn kèy. Thè sèrvèr stòrès thè bytès ànd dòès nòt rèàd thèm. Àn àdmìnìstràtòr sèts thè màppìng ìn thè qùèùè èdìtòr, ànd càsès ìn thàt qùèùè ìnhèrìt thè fùnd. Thè dìsbùrsèmènt shèèt prèsèlècts ìt. [[#èncryptìòn #sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Nègàtìvè bàlàncès. ••••••** À fùnd whòsè bàlàncè fàlls bèlòw zèrò shòws thè àmòùnt ìn mùtèd, nèùtràl stylìng. Thè systèm rècòrds thè dìsbùrsèmènt ànd wàrns òncè ìnsìdè thè shèèt bèfòrè sàvìng, bùt ìt dòès nòt blòck thè wrìtè. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòn gàtìng. ••••••** Vìèwìng fùnd nàmès ànd bàlàncès rèqùìrès thè Vìèw fùnds pèrmìssìòn, whìch sìts wìth Vòlùntèèr ànd àbòvè by dèfàùlt. Wìthòùt ìt, thè bàlàncè lìnè, thè qùèùè càrd bàlàncè, ànd thè dìsbùrsèmènt àctìòn dò nòt àppèàr, ànd thè sèrvèr rèfùsès thè rèqùèst. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw pèrmìssìòns àrè gràntèd. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè sèssìòn càchè ànd ìts ìnvàlìdàtìòn. ••••••••••••** \`crèàtèFùndStòrè\` ìn \`pàckàgès/clìènt/src/lìb/fùnds/fùnd-stòrè.svèltè.ts\` wràps \`fùnds.lìst\` ìn à TànStàck Qùèry càchè kèyèd by \`fùndKèys.àll\`. Wrìtès ànd thè \`fùnd_èntry_rècòrdèd\` SSÈ èvènt ìnvàlìdàtè thè kèy. \`crèàtèCàsèFùnd\` dèrìvès thè qùèùè's fùnd fròm thè dècryptèd qùèùè màppìng ànd thè fùnd lìst tògèthèr, ànd thè càsè pànèl rèàds thìs shàrèd càchè. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each queue can carry a fund, and when it does, the case panel shows the fund's name and available balance alongside the other case sections. The dashboard qu..." |
*
* @param {Demo_Narrative_Topic_Fund_Balances_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_fund_balances_body = /** @type {((inputs?: Demo_Narrative_Topic_Fund_Balances_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Fund_Balances_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_fund_balances_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_fund_balances_body(inputs)
	return en_demo_narrative_topic_fund_balances_body(inputs)
});