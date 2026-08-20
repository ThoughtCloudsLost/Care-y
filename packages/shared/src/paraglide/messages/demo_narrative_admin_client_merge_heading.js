/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Client_Merge_HeadingInputs */

const en_demo_narrative_admin_client_merge_heading = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merging clients`)
};

const es_demo_narrative_admin_client_merge_heading = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusionar clientes`)
};

/**
* | output |
* | --- |
* | "Merging clients" |
*
* @param {Demo_Narrative_Admin_Client_Merge_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_client_merge_heading = /** @type {((inputs?: Demo_Narrative_Admin_Client_Merge_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Client_Merge_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_client_merge_heading(inputs)
	return es_demo_narrative_admin_client_merge_heading(inputs)
});