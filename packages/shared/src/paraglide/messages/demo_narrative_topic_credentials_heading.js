/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Credentials_HeadingInputs */

const en_demo_narrative_topic_credentials_heading = /** @type {(inputs: Demo_Narrative_Topic_Credentials_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Username and password`)
};

const es_demo_narrative_topic_credentials_heading = /** @type {(inputs: Demo_Narrative_Topic_Credentials_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de usuario y contraseña`)
};

/**
* | output |
* | --- |
* | "Username and password" |
*
* @param {Demo_Narrative_Topic_Credentials_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_heading = /** @type {((inputs?: Demo_Narrative_Topic_Credentials_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Credentials_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_credentials_heading(inputs)
	return es_demo_narrative_topic_credentials_heading(inputs)
});