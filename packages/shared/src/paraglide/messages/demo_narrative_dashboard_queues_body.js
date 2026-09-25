/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Queues_BodyInputs */

const en_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each active queue the user belongs to appears as a card. Each card shows a count of open tickets and a count of urgent tickets. Which cards appear depends on queue membership, so two accounts in the same organization can see different sets. [[#permissions #privacy]]
**Counts and what they include.** The open count includes tickets on hold. The urgent count includes only open tickets that are not on hold and whose priority is urgent. Both counts are computed from the tickets table at request time, not stored totals. They update as soon as any ticket in the organization is created, closed, or reassigned. [[#metadata]]
**What the server stores per queue.** Each queue's name, color, and icon are organization-key ciphertext that the browser decrypts. Its sort order, escalation threshold, active flag, and creation time are plaintext. A database dump reveals how many queues an organization runs, their order, their age, and the open and urgent counts in each. It does not reveal any queue's name, color, or icon. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds #metadata]]
**Queue count source and schema history.** \`listActive\` in \`packages/server/src/tickets/queue-service.ts\` builds the counts. The route filters results against membership rows from \`034_create_queue_assignments.ts\`. \`045_encrypt_queue_names.ts\` converted the name column to ciphertext and dropped the plaintext column. \`078_add_queue_color_icon.ts\` added color and icon as nullable bytea columns. A queue created before that migration has neither field, and the browser draws a default. [Queue management](#admin-people/queues) covers creating and reordering queues. [[#encryption]]`)
};

const es_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada cola activa a la que pertenece el usuario aparece como una tarjeta. Cada tarjeta muestra un recuento de tickets abiertos y un recuento de tickets urgentes. Las tarjetas que aparecen dependen de la membresía de cola, de modo que dos cuentas en la misma organización pueden ver conjuntos distintos. [[#permissions #privacy]]
**Recuentos y qué incluyen.** El recuento de abiertos incluye tickets en espera. El recuento de urgentes incluye solo tickets abiertos que no están en espera y cuya prioridad es urgente. Ambos recuentos se calculan a partir de la tabla de tickets en el momento de la solicitud, no como totales almacenados. Se actualizan en cuanto cualquier ticket de la organización se crea, se cierra o se reasigna. [[#metadata]]
**Lo que el servidor almacena por cola.** El nombre, el color y el icono de cada cola son texto cifrado con la clave de organización que el navegador descifra. Su orden de clasificación, umbral de escalamiento, indicador de activación y fecha de creación son texto plano. Un volcado de base de datos revela cuántas colas tiene una organización, su orden, su antigüedad y los recuentos de tickets abiertos y urgentes en cada una. No revela el nombre, el color ni el icono de ninguna cola. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) cubre la clave de organización. [[#encryption #server-holds #metadata]]
**Origen del recuento de colas e historial del esquema.** \`listActive\` en \`packages/server/src/tickets/queue-service.ts\` construye los recuentos. La ruta filtra los resultados contra las filas de membresía de \`034_create_queue_assignments.ts\`. \`045_encrypt_queue_names.ts\` convirtió la columna de nombre a texto cifrado y eliminó la columna de texto plano. \`078_add_queue_color_icon.ts\` añadió color e icono como columnas bytea anulables. Una cola creada antes de esa migración no tiene ninguno de los dos campos, y el navegador dibuja un valor predeterminado. [Gestión de colas](#admin-people/queues) cubre la creación y el reordenamiento de colas. [[#encryption]]`)
};

const en_xa2_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch àctìvè qùèùè thè ùsèr bèlòngs tò àppèàrs às à càrd. Èàch càrd shòws à còùnt òf òpèn tìckèts ànd à còùnt òf ùrgènt tìckèts. Whìch càrds àppèàr dèpènds òn qùèùè mèmbèrshìp, sò twò àccòùnts ìn thè sàmè òrgànìzàtìòn càn sèè dìffèrènt sèts. [[#pèrmìssìòns #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còùnts ànd whàt thèy ìnclùdè. •••••••••** Thè òpèn còùnt ìnclùdès tìckèts òn hòld. Thè ùrgènt còùnt ìnclùdès ònly òpèn tìckèts thàt àrè nòt òn hòld ànd whòsè prìòrìty ìs ùrgènt. Bòth còùnts àrè còmpùtèd fròm thè tìckèts tàblè àt rèqùèst tìmè, nòt stòrèd tòtàls. Thèy ùpdàtè às sòòn às àny tìckèt ìn thè òrgànìzàtìòn ìs crèàtèd, clòsèd, òr rèàssìgnèd. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr stòrès pèr qùèùè. ••••••••••** Èàch qùèùè's nàmè, còlòr, ànd ìcòn àrè òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts. Ìts sòrt òrdèr, èscàlàtìòn thrèshòld, àctìvè flàg, ànd crèàtìòn tìmè àrè plàìntèxt. À dàtàbàsè dùmp rèvèàls hòw màny qùèùès àn òrgànìzàtìòn rùns, thèìr òrdèr, thèìr àgè, ànd thè òpèn ànd ùrgènt còùnts ìn èàch. Ìt dòès nòt rèvèàl àny qùèùè's nàmè, còlòr, òr ìcòn. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy. [[#èncryptìòn #sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèùè còùnt sòùrcè ànd schèmà hìstòry. ••••••••••••** \`lìstÀctìvè\` ìn \`pàckàgès/sèrvèr/src/tìckèts/qùèùè-sèrvìcè.ts\` bùìlds thè còùnts. Thè ròùtè fìltèrs rèsùlts àgàìnst mèmbèrshìp ròws fròm \`034_crèàtè_qùèùè_àssìgnmènts.ts\`. \`045_èncrypt_qùèùè_nàmès.ts\` cònvèrtèd thè nàmè còlùmn tò cìphèrtèxt ànd dròppèd thè plàìntèxt còlùmn. \`078_àdd_qùèùè_còlòr_ìcòn.ts\` àddèd còlòr ànd ìcòn às nùllàblè bytèà còlùmns. À qùèùè crèàtèd bèfòrè thàt mìgràtìòn hàs nèìthèr fìèld, ànd thè bròwsèr dràws à dèfàùlt. [Qùèùè mànàgèmènt](#àdmìn-pèòplè/qùèùès) còvèrs crèàtìng ànd rèòrdèrìng qùèùès. [[#èncryptìòn]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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