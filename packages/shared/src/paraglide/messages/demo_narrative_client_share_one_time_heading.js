/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_One_Time_HeadingInputs */

const en_demo_narrative_client_share_one_time_heading = /** @type {(inputs: Demo_Narrative_Client_Share_One_Time_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Single use access`)
};

const es_demo_narrative_client_share_one_time_heading = /** @type {(inputs: Demo_Narrative_Client_Share_One_Time_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acceso de un solo uso`)
};

/**
* | output |
* | --- |
* | "Single use access" |
*
* @param {Demo_Narrative_Client_Share_One_Time_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_one_time_heading = /** @type {((inputs?: Demo_Narrative_Client_Share_One_Time_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_One_Time_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_one_time_heading(inputs)
	return en_demo_narrative_client_share_one_time_heading(inputs)
});