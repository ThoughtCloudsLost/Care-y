/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Split_View_BodyInputs */

const en_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On wider screens, the ticket list supports a split view where the list and a ticket detail pane sit side by side. Selecting a ticket from the list opens its detail in the right pane without navigating away from the list.
**When it appears.** The split view activates automatically when the screen is wide enough. On mobile or narrow windows, tapping a ticket navigates to a full screen detail view instead.
**Full screen.** Double tapping a ticket opens it full screen even while the split view is active.`)
};

const es_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En pantallas más anchas, la lista de tickets soporta una vista dividida donde la lista y un panel de detalle del ticket se sientan lado a lado. Seleccionar un ticket de la lista abre su detalle en el panel derecho sin navegar fuera de la lista.
**Cuándo aparece.** La vista dividida se activa automáticamente cuando la pantalla es suficientemente ancha. En móvil o ventanas estrechas, tocar un ticket navega a una vista de detalle a pantalla completa.
**Pantalla completa.** Tocar dos veces un ticket lo abre a pantalla completa incluso mientras la vista dividida está activa.`)
};

/**
* | output |
* | --- |
* | "On wider screens, the ticket list supports a split view where the list and a ticket detail pane sit side by side. Selecting a ticket from the list opens its ..." |
*
* @param {Demo_Narrative_Topic_Split_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_split_view_body = /** @type {((inputs?: Demo_Narrative_Topic_Split_View_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Split_View_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_split_view_body(inputs)
	return es_demo_narrative_topic_split_view_body(inputs)
});