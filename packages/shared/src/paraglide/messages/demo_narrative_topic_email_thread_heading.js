/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Email_Thread_HeadingInputs */

const en_demo_narrative_topic_email_thread_heading = /** @type {(inputs: Demo_Narrative_Topic_Email_Thread_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email in the conversation`)
};

const es_demo_narrative_topic_email_thread_heading = /** @type {(inputs: Demo_Narrative_Topic_Email_Thread_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo electrónico en la conversación`)
};

/**
* | output |
* | --- |
* | "Email in the conversation" |
*
* @param {Demo_Narrative_Topic_Email_Thread_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_email_thread_heading = /** @type {((inputs?: Demo_Narrative_Topic_Email_Thread_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Email_Thread_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_email_thread_heading(inputs)
	return en_demo_narrative_topic_email_thread_heading(inputs)
});