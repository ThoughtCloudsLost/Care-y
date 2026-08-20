/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Clients_BodyInputs */

const en_demo_narrative_admin_clients_body = /** @type {(inputs: Demo_Narrative_Admin_Clients_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The client list shows all clients who have contacted the organization. Client records link to their associated tickets.
**Encryption.** Client identifiers are encrypted. The level of detail visible to each volunteer depends on their role and assignment to the relevant tickets.`)
};

const es_demo_narrative_admin_clients_body = /** @type {(inputs: Demo_Narrative_Admin_Clients_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de clientes muestra todos los clientes que han contactado a la organización. Los registros de clientes enlazan a sus tickets asociados.
**Cifrado.** Los identificadores de los clientes están cifrados. El nivel de detalle visible para cada voluntario depende de su rol y asignación a los tickets correspondientes.`)
};

/**
* | output |
* | --- |
* | "The client list shows all clients who have contacted the organization. Client records link to their associated tickets. **Encryption.** Client identifiers ar..." |
*
* @param {Demo_Narrative_Admin_Clients_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_clients_body = /** @type {((inputs?: Demo_Narrative_Admin_Clients_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Clients_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_clients_body(inputs)
	return es_demo_narrative_admin_clients_body(inputs)
});