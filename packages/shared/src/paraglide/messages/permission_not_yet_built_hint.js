/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Not_Yet_Built_HintInputs */

const en_permission_not_yet_built_hint = /** @type {(inputs: Permission_Not_Yet_Built_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View own shifts has nothing behind it yet. It is listed so its name stays settled, but granting it changes nothing until shift scheduling is built.`)
};

const es_permission_not_yet_built_hint = /** @type {(inputs: Permission_Not_Yet_Built_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver turnos propios todavía no tiene nada detrás. Aparece para fijar su nombre, pero concederlo no cambia nada hasta que se construya la programación de turnos.`)
};

/**
* | output |
* | --- |
* | "View own shifts has nothing behind it yet. It is listed so its name stays settled, but granting it changes nothing until shift scheduling is built." |
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