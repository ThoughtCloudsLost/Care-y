/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown>, tickets: NonNullable<unknown>, ticket: NonNullable<unknown> }} Admin_Queue_Watchers_HintInputs */

const en_admin_queue_watchers_hint = /** @type {(inputs: Admin_Queue_Watchers_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Watchers are notified about new activity in this ${i?.queue} but do not receive read access to its ${i?.tickets}. Members, by contrast, can read every ${i?.ticket} in the ${i?.queue}.`)
};

const es_admin_queue_watchers_hint = /** @type {(inputs: Admin_Queue_Watchers_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los observadores reciben notificaciones sobre actividad nueva en esta ${i?.queue}, pero no obtienen acceso de lectura a sus ${i?.tickets}. Los miembros, en cambio, pueden leer cada ${i?.ticket} de la ${i?.queue}.`)
};

/**
* | output |
* | --- |
* | "Watchers are notified about new activity in this {queue} but do not receive read access to its {tickets}. Members, by contrast, can read every {ticket} in th..." |
*
* @param {Admin_Queue_Watchers_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watchers_hint = /** @type {((inputs: Admin_Queue_Watchers_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Watchers_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_watchers_hint(inputs)
	return en_admin_queue_watchers_hint(inputs)
});