/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Thread_Load_ErrorInputs */

const en_portal_thread_load_error = /** @type {(inputs: Portal_Thread_Load_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your messages could not load. This page will try again on its own.`)
};

const es_portal_thread_load_error = /** @type {(inputs: Portal_Thread_Load_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudieron cargar tus mensajes. Esta página lo intentará de nuevo por sí sola.`)
};

const en_xa2_portal_thread_load_error = /** @type {(inputs: Portal_Thread_Load_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr mèssàgès còùld nòt lòàd. Thìs pàgè wìll try àgàìn òn ìts òwn. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your messages could not load. This page will try again on its own." |
*
* @param {Portal_Thread_Load_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_thread_load_error = /** @type {((inputs?: Portal_Thread_Load_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Thread_Load_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_thread_load_error(inputs)
	if (locale === "en-XA") return en_xa2_portal_thread_load_error(inputs)
	return en_portal_thread_load_error(inputs)
});