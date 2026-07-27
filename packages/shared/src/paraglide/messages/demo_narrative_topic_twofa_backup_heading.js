/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_HeadingInputs */

const en_demo_narrative_topic_twofa_backup_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Backup codes`)
};

const es_demo_narrative_topic_twofa_backup_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Codigos de respaldo`)
};

/**
* | output |
* | --- |
* | "Backup codes" |
*
* @param {Demo_Narrative_Topic_Twofa_Backup_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_backup_heading = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Backup_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Backup_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_backup_heading(inputs)
	return es_demo_narrative_topic_twofa_backup_heading(inputs)
});