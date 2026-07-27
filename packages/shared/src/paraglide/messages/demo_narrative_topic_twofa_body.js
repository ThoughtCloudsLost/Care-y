/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After your password, CARE-Y requires a second factor. Six methods are supported, and each one confirms your identity before the system proceeds to derive your encryption keys. No single compromised factor grants access. Open any method in the phone to see its screen.`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Despues de tu contrasena, CARE-Y requiere un segundo factor. Se admiten seis metodos, y cada uno confirma tu identidad antes de que el sistema proceda a derivar tus claves de cifrado. Ningun factor comprometido individualmente otorga acceso. Abre cualquier metodo en el telefono para ver su pantalla.`)
};

/**
* | output |
* | --- |
* | "After your password, CARE-Y requires a second factor. Six methods are supported, and each one confirms your identity before the system proceeds to derive you..." |
*
* @param {Demo_Narrative_Topic_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_body(inputs)
	return es_demo_narrative_topic_twofa_body(inputs)
});