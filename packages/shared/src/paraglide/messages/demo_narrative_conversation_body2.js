/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Conversation_Body2Inputs */

const en_demo_narrative_conversation_body2 = /** @type {(inputs: Demo_Narrative_Conversation_Body2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal notes between volunteers are also encrypted. The server relays ciphertext without ever reading the content.`)
};

const es_demo_narrative_conversation_body2 = /** @type {(inputs: Demo_Narrative_Conversation_Body2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las notas internas entre voluntarios también se cifran. El servidor transmite texto cifrado sin leer el contenido.`)
};

const en_xa2_demo_narrative_conversation_body2 = /** @type {(inputs: Demo_Narrative_Conversation_Body2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntèrnàl nòtès bètwèèn vòlùntèèrs àrè àlsò èncryptèd. Thè sèrvèr rèlàys cìphèrtèxt wìthòùt èvèr rèàdìng thè còntènt. •••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Internal notes between volunteers are also encrypted. The server relays ciphertext without ever reading the content." |
*
* @param {Demo_Narrative_Conversation_Body2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_conversation_body2 = /** @type {((inputs?: Demo_Narrative_Conversation_Body2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Conversation_Body2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_conversation_body2(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_conversation_body2(inputs)
	return en_demo_narrative_conversation_body2(inputs)
});