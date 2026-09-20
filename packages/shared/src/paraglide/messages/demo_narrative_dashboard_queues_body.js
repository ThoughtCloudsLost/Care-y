/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Queues_BodyInputs */

const en_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One card per queue defined by the organization, showing live counts of open and urgent tickets.
**Live counts.** Counts are real-time database queries, not cached snapshots. They update automatically when tickets are created, closed, or reassigned anywhere in the system.
**Encryption.** Queue names and appearance settings are encrypted with the organization key. The server stores only ciphertext. The browser decrypts them at display time.`)
};

const es_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una tarjeta por cola definida por la organización, con conteos en tiempo real de tickets abiertos y urgentes.
**Conteos en tiempo real.** Los conteos son consultas directas a la base de datos, no capturas en caché. Se actualizan automáticamente cuando se crean, cierran o reasignan tickets en cualquier parte del sistema.
**Cifrado.** Los nombres y la configuración de apariencia de las colas están cifrados con la clave de la organización. El servidor almacena solo texto cifrado. El navegador los descifra para mostrarlos.`)
};

const en_xa2_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònè càrd pèr qùèùè dèfìnèd by thè òrgànìzàtìòn, shòwìng lìvè còùnts òf òpèn ànd ùrgènt tìckèts.
 •••••••••••••••••••••••••••••**Lìvè còùnts. ••••** Còùnts àrè rèàl-tìmè dàtàbàsè qùèrìès, nòt càchèd snàpshòts. Thèy ùpdàtè àùtòmàtìcàlly whèn tìckèts àrè crèàtèd, clòsèd, òr rèàssìgnèd ànywhèrè ìn thè systèm.
 ••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Qùèùè nàmès ànd àppèàràncè sèttìngs àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Thè sèrvèr stòrès ònly cìphèrtèxt. Thè bròwsèr dècrypts thèm àt dìsplày tìmè. •••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "One card per queue defined by the organization, showing live counts of open and urgent tickets. **Live counts.** Counts are real-time database queries, not c..." |
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