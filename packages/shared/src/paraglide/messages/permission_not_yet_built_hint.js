/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Not_Yet_Built_HintInputs */

const en_permission_not_yet_built_hint = /** @type {(inputs: Permission_Not_Yet_Built_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Four of these have nothing behind them yet: Link cases together, Set who is notified about a queue, Manage saved replies, and Delete client records. They are listed so their names stay settled, but granting one changes nothing until the feature is built.`)
};

const es_permission_not_yet_built_hint = /** @type {(inputs: Permission_Not_Yet_Built_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuatro de estos permisos todavia no tienen nada detras: Vincular casos entre si, Definir quien recibe notificaciones de una cola, Administrar respuestas guardadas y Eliminar registros de clientes. Aparecen para fijar sus nombres, pero concederlos no cambia nada hasta que se construya la funcion.`)
};

/**
* | output |
* | --- |
* | "Four of these have nothing behind them yet: Link cases together, Set who is notified about a queue, Manage saved replies, and Delete client records. They are..." |
*
* @param {Permission_Not_Yet_Built_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_not_yet_built_hint = /** @type {((inputs?: Permission_Not_Yet_Built_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Not_Yet_Built_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_not_yet_built_hint(inputs)
	return en_permission_not_yet_built_hint(inputs)
});