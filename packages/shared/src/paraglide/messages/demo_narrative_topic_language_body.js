/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Language_BodyInputs */

const en_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch the interface language without reloading. Translations are bundled in the app. The server does not know which language you are using because no preference is transmitted.`)
};

const es_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambia el idioma de la interfaz sin recargar. Las traducciones estan incluidas en la aplicacion. El servidor no sabe que idioma estas usando porque no se transmite ninguna preferencia.`)
};

/**
* | output |
* | --- |
* | "Switch the interface language without reloading. Translations are bundled in the app. The server does not know which language you are using because no prefer..." |
*
* @param {Demo_Narrative_Topic_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_body = /** @type {((inputs?: Demo_Narrative_Topic_Language_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Language_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_language_body(inputs)
	return es_demo_narrative_topic_language_body(inputs)
});