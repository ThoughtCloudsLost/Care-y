/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Thread_Rate_LimitedInputs */

const en_portal_thread_rate_limited = /** @type {(inputs: Portal_Thread_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your messages are paused for a moment because too many loaded in a short time. Your link still works. This page will try again on its own.`)
};

const es_portal_thread_rate_limited = /** @type {(inputs: Portal_Thread_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus mensajes están en pausa por un momento porque se cargaron demasiados en poco tiempo. Tu enlace sigue funcionando. Esta página lo intentará de nuevo por sí sola.`)
};

/**
* | output |
* | --- |
* | "Your messages are paused for a moment because too many loaded in a short time. Your link still works. This page will try again on its own." |
*
* @param {Portal_Thread_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_thread_rate_limited = /** @type {((inputs?: Portal_Thread_Rate_LimitedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Thread_Rate_LimitedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_thread_rate_limited(inputs)
	return en_portal_thread_rate_limited(inputs)
});