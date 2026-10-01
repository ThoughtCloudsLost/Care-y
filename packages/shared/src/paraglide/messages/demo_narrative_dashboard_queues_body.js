/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Queues_BodyInputs */

const en_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each active queue the user belongs to appears as a card. Each card shows a count of open tickets and a count of urgent tickets. Which cards appear depends on queue membership, so two users in the same organization can see different sets. [[#permissions #privacy]]
**Counts and what they include.** The open count includes tickets on hold. The urgent count includes only open tickets that are not on hold and whose priority is urgent. Both counts are computed from the tickets table at request time, not stored totals. Counts refresh live whenever a ticket the user has access to changes. A change to a ticket the user cannot access does not update the counts. [[#metadata]]
**What does the server store per queue?** Each queue's name, color, and icon are organization-key ciphertext that the browser decrypts. Its sort order, escalation threshold, active flag, and creation time are plaintext. A database dump reveals how many queues an organization runs, their order, their age, and the open and urgent counts in each. It does not reveal any queue's name, color, or icon. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds #metadata]]
**Queue count source and schema.** \`listActive\` in \`packages/server/src/tickets/queue-service.ts\` builds the counts. The route filters results against membership rows in \`queue_assignments\`, defined in \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. The \`queues\` table stores the name only as ciphertext, with no plaintext column. Color and icon are nullable bytea columns. A queue with neither field set is drawn with a default in the browser. [Queue management](#admin-people/queues) covers creating and reordering queues. [[#encryption]]`)
};

const es_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada cola activa a la que pertenece la persona usuaria aparece como una tarjeta. Cada tarjeta muestra un recuento de tickets abiertos y un recuento de tickets urgentes. Las tarjetas que aparecen dependen de la membresía de cola, de modo que dos personas usuarias en la misma organización pueden ver conjuntos distintos. [[#permissions #privacy]]
**Recuentos y qué incluyen.** El recuento de abiertos incluye tickets en espera. El recuento de urgentes incluye solo tickets abiertos que no están en espera y cuya prioridad es urgente. Ambos recuentos se calculan a partir de la tabla de tickets en el momento de la solicitud, no como totales almacenados. Los recuentos se actualizan en tiempo real cuando cambia un ticket al que la persona usuaria tiene acceso. Un cambio en un ticket al que la persona usuaria no tiene acceso no actualiza los recuentos. [[#metadata]]
**¿Qué almacena el servidor por cola?** El nombre, el color y el icono de cada cola son texto cifrado con la clave de organización que el navegador descifra. Su orden de clasificación, umbral de escalamiento, indicador de activación y fecha de creación son texto plano. Un volcado de base de datos revela cuántas colas tiene una organización, su orden, su antigüedad y los recuentos de tickets abiertos y urgentes en cada una. No revela el nombre, el color ni el icono de ninguna cola. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) cubre la clave de organización. [[#encryption #server-holds #metadata]]
**Origen del recuento de colas y esquema.** \`listActive\` en \`packages/server/src/tickets/queue-service.ts\` construye los recuentos. La ruta filtra los resultados contra las filas de membresía de \`queue_assignments\`, definida en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. La tabla \`queues\` guarda el nombre solo como texto cifrado, sin columna de texto plano. El color y el icono son columnas bytea anulables. Si una cola no tiene ninguno de los dos campos, el navegador dibuja un valor predeterminado. [Gestión de colas](#admin-people/queues) cubre la creación y el reordenamiento de colas. [[#encryption]]`)
};

const en_xa2_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch àctìvè qùèùè thè ùsèr bèlòngs tò àppèàrs às à càrd. Èàch càrd shòws à còùnt òf òpèn tìckèts ànd à còùnt òf ùrgènt tìckèts. Whìch càrds àppèàr dèpènds òn qùèùè mèmbèrshìp, sò twò ùsèrs ìn thè sàmè òrgànìzàtìòn càn sèè dìffèrènt sèts. [[#pèrmìssìòns #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còùnts ànd whàt thèy ìnclùdè. •••••••••** Thè òpèn còùnt ìnclùdès tìckèts òn hòld. Thè ùrgènt còùnt ìnclùdès ònly òpèn tìckèts thàt àrè nòt òn hòld ànd whòsè prìòrìty ìs ùrgènt. Bòth còùnts àrè còmpùtèd fròm thè tìckèts tàblè àt rèqùèst tìmè, nòt stòrèd tòtàls. Còùnts rèfrèsh lìvè whènèvèr à tìckèt thè ùsèr hàs àccèss tò chàngès. À chàngè tò à tìckèt thè ùsèr cànnòt àccèss dòès nòt ùpdàtè thè còùnts. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr stòrè pèr qùèùè? ••••••••••••** Èàch qùèùè's nàmè, còlòr, ànd ìcòn àrè òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts. Ìts sòrt òrdèr, èscàlàtìòn thrèshòld, àctìvè flàg, ànd crèàtìòn tìmè àrè plàìntèxt. À dàtàbàsè dùmp rèvèàls hòw màny qùèùès àn òrgànìzàtìòn rùns, thèìr òrdèr, thèìr àgè, ànd thè òpèn ànd ùrgènt còùnts ìn èàch. Ìt dòès nòt rèvèàl àny qùèùè's nàmè, còlòr, òr ìcòn. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy. [[#èncryptìòn #sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèùè còùnt sòùrcè ànd schèmà. •••••••••** \`lìstÀctìvè\` ìn \`pàckàgès/sèrvèr/src/tìckèts/qùèùè-sèrvìcè.ts\` bùìlds thè còùnts. Thè ròùtè fìltèrs rèsùlts àgàìnst mèmbèrshìp ròws ìn \`qùèùè_àssìgnmènts\`, dèfìnèd ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`. Thè \`qùèùès\` tàblè stòrès thè nàmè ònly às cìphèrtèxt, wìth nò plàìntèxt còlùmn. Còlòr ànd ìcòn àrè nùllàblè bytèà còlùmns. À qùèùè wìth nèìthèr fìèld sèt ìs dràwn wìth à dèfàùlt ìn thè bròwsèr. [Qùèùè mànàgèmènt](#àdmìn-pèòplè/qùèùès) còvèrs crèàtìng ànd rèòrdèrìng qùèùès. [[#èncryptìòn]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each active queue the user belongs to appears as a card. Each card shows a count of open tickets and a count of urgent tickets. Which cards appear depends on..." |
*
* @param {Demo_Narrative_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_queues_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Queues_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Queues_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_queues_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_queues_body(inputs)
	return en_demo_narrative_dashboard_queues_body(inputs)
});