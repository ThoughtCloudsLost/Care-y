/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Activity_MentionInputs */

const en_dashboard_activity_mention = /** @type {(inputs: Dashboard_Activity_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mention`)
};

const es_dashboard_activity_mention = /** @type {(inputs: Dashboard_Activity_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mención`)
};

const en_xa2_dashboard_activity_mention = /** @type {(inputs: Dashboard_Activity_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèntìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Mention" |
*
* @param {Dashboard_Activity_MentionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_mention = /** @type {((inputs?: Dashboard_Activity_MentionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_MentionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_mention(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_mention(inputs)
	return en_dashboard_activity_mention(inputs)
});