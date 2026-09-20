/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Tickets_BodyInputs */

const en_demo_narrative_tickets_body = /** @type {(inputs: Demo_Narrative_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket titles, descriptions, and messages are encrypted with keys only your browser holds. The server stores ciphertext and never sees the content.`)
};

const es_demo_narrative_tickets_body = /** @type {(inputs: Demo_Narrative_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los títulos, descripciones y mensajes de los tickets se cifran con claves que solo tu navegador posee. El servidor almacena texto cifrado y nunca ve el contenido.`)
};

const en_xa2_demo_narrative_tickets_body = /** @type {(inputs: Demo_Narrative_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèt tìtlès, dèscrìptìòns, ànd mèssàgès àrè èncryptèd wìth kèys ònly yòùr bròwsèr hòlds. Thè sèrvèr stòrès cìphèrtèxt ànd nèvèr sèès thè còntènt. •••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Ticket titles, descriptions, and messages are encrypted with keys only your browser holds. The server stores ciphertext and never sees the content." |
*
* @param {Demo_Narrative_Tickets_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tickets_body = /** @type {((inputs?: Demo_Narrative_Tickets_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Tickets_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_tickets_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_tickets_body(inputs)
	return en_demo_narrative_tickets_body(inputs)
});