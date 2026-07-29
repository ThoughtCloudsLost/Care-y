/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Admin_Quarantine_HeadingInputs */

const en_demo_narrative_topic_admin_quarantine_heading = /** @type {(inputs: Demo_Narrative_Topic_Admin_Quarantine_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail quarantine`)
};

const es_demo_narrative_topic_admin_quarantine_heading = /** @type {(inputs: Demo_Narrative_Topic_Admin_Quarantine_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuarentena de correo de voz`)
};

/**
* | output |
* | --- |
* | "Voicemail quarantine" |
*
* @param {Demo_Narrative_Topic_Admin_Quarantine_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_admin_quarantine_heading = /** @type {((inputs?: Demo_Narrative_Topic_Admin_Quarantine_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Admin_Quarantine_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_admin_quarantine_heading(inputs)
	return es_demo_narrative_topic_admin_quarantine_heading(inputs)
});