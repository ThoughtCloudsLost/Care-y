/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Thread_HeadingInputs */

const en_demo_narrative_client_account_thread_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Durable thread`)
};

const es_demo_narrative_client_account_thread_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hilo duradero`)
};

const en_xa2_demo_narrative_client_account_thread_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dùràblè thrèàd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Durable thread" |
*
* @param {Demo_Narrative_Client_Account_Thread_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_thread_heading = /** @type {((inputs?: Demo_Narrative_Client_Account_Thread_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Thread_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_thread_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_thread_heading(inputs)
	return en_demo_narrative_client_account_thread_heading(inputs)
});